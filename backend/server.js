const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5051;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'rachapay.db');

// Garantir que o diretório data existe
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Inicializar banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
    initDatabase();
  }
});

// Criar tabelas
function initDatabase() {
  db.serialize(() => {
    // Tabela de jogos
    db.run(`CREATE TABLE IF NOT EXISTS jogos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de jogadores (relação muitos-para-muitos com status de pagamento)
    db.run(`CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jogo_id INTEGER NOT NULL,
      jogador_nome TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'devendo',
      FOREIGN KEY (jogo_id) REFERENCES jogos(id) ON DELETE CASCADE,
      UNIQUE(jogo_id, jogador_nome)
    )`);

    console.log('Tabelas criadas/verificadas com sucesso');
  });
}

// Rotas

// Listar todos os jogos
app.get('/api/jogos', (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];
  
  db.all(`
    SELECT 
      j.id,
      j.data,
      j.created_at,
      COUNT(p.id) as total_jogadores,
      SUM(CASE WHEN p.status = 'pago' THEN 1 ELSE 0 END) as pagos,
      SUM(CASE WHEN p.status = 'devendo' THEN 1 ELSE 0 END) as devendo
    FROM jogos j
    LEFT JOIN pagamentos p ON j.id = p.jogo_id
    GROUP BY j.id, j.data, j.created_at
    ORDER BY j.data DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obter um jogo específico com seus jogadores
app.get('/api/jogos/:id', (req, res) => {
  const jogoId = req.params.id;
  
  db.get('SELECT * FROM jogos WHERE id = ?', [jogoId], (err, jogo) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!jogo) {
      res.status(404).json({ error: 'Jogo não encontrado' });
      return;
    }
    
    db.all('SELECT * FROM pagamentos WHERE jogo_id = ? ORDER BY jogador_nome', [jogoId], (err, pagamentos) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        ...jogo,
        jogadores: pagamentos
      });
    });
  });
});

// Criar novo jogo
app.post('/api/jogos', (req, res) => {
  const { data, jogadores } = req.body;
  
  if (!data) {
    res.status(400).json({ error: 'Data é obrigatória' });
    return;
  }
  
  if (!jogadores || !Array.isArray(jogadores) || jogadores.length === 0) {
    res.status(400).json({ error: 'Lista de jogadores é obrigatória' });
    return;
  }
  
  db.run('INSERT INTO jogos (data) VALUES (?)', [data], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const jogoId = this.lastID;
    const stmt = db.prepare('INSERT INTO pagamentos (jogo_id, jogador_nome, status) VALUES (?, ?, ?)');
    
    jogadores.forEach(jogador => {
      const nome = typeof jogador === 'string' ? jogador : jogador.nome;
      const status = typeof jogador === 'object' && jogador.status ? jogador.status : 'devendo';
      stmt.run([jogoId, nome, status]);
    });
    
    stmt.finalize((err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.status(201).json({ id: jogoId, data, jogadores: jogadores.length });
    });
  });
});

// Atualizar status de pagamento
app.put('/api/jogos/:jogoId/jogadores/:jogadorNome', (req, res) => {
  const { jogoId, jogadorNome } = req.params;
  const { status } = req.body;
  
  if (!status || !['pago', 'devendo'].includes(status)) {
    res.status(400).json({ error: 'Status deve ser "pago" ou "devendo"' });
    return;
  }
  
  db.run(
    'UPDATE pagamentos SET status = ? WHERE jogo_id = ? AND jogador_nome = ?',
    [status, jogoId, jogadorNome],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Jogador não encontrado neste jogo' });
        return;
      }
      
      res.json({ success: true, jogoId, jogadorNome, status });
    }
  );
});

// Adicionar jogador a um jogo existente
app.post('/api/jogos/:jogoId/jogadores', (req, res) => {
  const { jogoId } = req.params;
  const { nome, status } = req.body;
  
  if (!nome) {
    res.status(400).json({ error: 'Nome do jogador é obrigatório' });
    return;
  }
  
  db.run(
    'INSERT INTO pagamentos (jogo_id, jogador_nome, status) VALUES (?, ?, ?)',
    [jogoId, nome, status || 'devendo'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: 'Jogador já existe neste jogo' });
          return;
        }
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.status(201).json({ id: this.lastID, jogoId, nome, status: status || 'devendo' });
    }
  );
});

// Remover jogador de um jogo
app.delete('/api/jogos/:jogoId/jogadores/:jogadorNome', (req, res) => {
  const { jogoId, jogadorNome } = req.params;
  
  db.run(
    'DELETE FROM pagamentos WHERE jogo_id = ? AND jogador_nome = ?',
    [jogoId, jogadorNome],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Jogador não encontrado neste jogo' });
        return;
      }
      
      res.json({ success: true });
    }
  );
});

// Obter débitos agrupados por jogador
app.get('/api/debitos', (req, res) => {
  db.all(`
    SELECT 
      p.jogador_nome,
      COUNT(*) as total_jogos_devendo,
      COUNT(*) * 5.0 as valor_total_devendo
    FROM pagamentos p
    WHERE p.status = 'devendo'
    GROUP BY p.jogador_nome
    ORDER BY valor_total_devendo DESC, p.jogador_nome
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obter detalhes dos débitos de um jogador específico
app.get('/api/debitos/:jogadorNome', (req, res) => {
  const { jogadorNome } = req.params;
  
  db.all(`
    SELECT 
      j.id as jogo_id,
      j.data,
      p.jogador_nome,
      p.status,
      5.0 as valor
    FROM pagamentos p
    INNER JOIN jogos j ON p.jogo_id = j.id
    WHERE p.jogador_nome = ? AND p.status = 'devendo'
    ORDER BY j.data DESC
  `, [jogadorNome], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const total = rows.length * 5.0;
    res.json({
      jogador_nome: jogadorNome,
      total_jogos: rows.length,
      valor_total: total,
      jogos: rows
    });
  });
});

// Deletar um jogo
app.delete('/api/jogos/:id', (req, res) => {
  const jogoId = req.params.id;
  
  db.run('DELETE FROM jogos WHERE id = ?', [jogoId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Jogo não encontrado' });
      return;
    }
    
    res.json({ success: true, message: 'Jogo deletado com sucesso' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: DB_PATH });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Banco de dados: ${DB_PATH}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conexão com banco de dados fechada.');
    process.exit(0);
  });
});

