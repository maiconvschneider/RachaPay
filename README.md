# ⚽ RachaPay - Controle de Peladas

Sistema web mobile-first para controle completo de peladas de futebol semanais, com foco em controle de pagamentos fixos por jogador (R$ 5,00).

## 📋 Características

- ✅ Interface mobile-first com tema escuro
- ✅ Controle de jogos passados, atuais e futuros
- ✅ Gestão de pagamentos por jogador (Pago/Devendo)
- ✅ Visualização clara de débitos
- ✅ Aplicação completa rodando em Docker
- ✅ Banco de dados SQLite (leve e simples)

## 🚀 Como Subir o Projeto

### Pré-requisitos

- Docker instalado
- Docker Compose instalado

### Passos

1. **Clone ou baixe o projeto**

2. **Na raiz do projeto, execute:**

```bash
docker-compose up --build
```

3. **Aguarde a inicialização** (pode levar alguns minutos na primeira vez)

4. **Acesse a aplicação:**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5051

## 🗄️ Informações do Banco de Dados

### Tipo de Banco
**SQLite** (banco de dados leve, sem necessidade de servidor separado)

### Configurações

- **Host:** Local (arquivo no sistema de arquivos)
- **Porta:** N/A (SQLite não usa porta)
- **Nome do banco:** `rachapay.db`
- **Usuário:** N/A (SQLite não requer autenticação)
- **Senha:** N/A
- **String de conexão:** `sqlite3:///app/data/rachapay.db` (dentro do container)
- **Caminho físico:** `./backend/data/rachapay.db` (no host)

### Estrutura do Banco

#### Tabela: `jogos`
- `id` (INTEGER PRIMARY KEY)
- `data` (TEXT) - Data do jogo no formato YYYY-MM-DD
- `created_at` (TEXT) - Timestamp de criação

#### Tabela: `pagamentos`
- `id` (INTEGER PRIMARY KEY)
- `jogo_id` (INTEGER) - Referência ao jogo
- `jogador_nome` (TEXT) - Nome do jogador
- `status` (TEXT) - 'pago' ou 'devendo'
- UNIQUE(jogo_id, jogador_nome)

### Como Conectar ao Banco de Dados

#### Opção 1: Via Docker (Recomendado)

```bash
# Acessar o container do backend
docker-compose exec backend sh

# Dentro do container, conectar ao SQLite
sqlite3 /app/data/rachapay.db
```

#### Opção 2: Diretamente no Host

Se você tiver SQLite instalado localmente:

```bash
sqlite3 ./backend/data/rachapay.db
```

#### Comandos SQL Úteis

```sql
-- Listar todos os jogos
SELECT * FROM jogos;

-- Listar todos os pagamentos
SELECT * FROM pagamentos;

-- Ver jogos com resumo de pagamentos
SELECT 
  j.id,
  j.data,
  COUNT(p.id) as total_jogadores,
  SUM(CASE WHEN p.status = 'pago' THEN 1 ELSE 0 END) as pagos,
  SUM(CASE WHEN p.status = 'devendo' THEN 1 ELSE 0 END) as devendo
FROM jogos j
LEFT JOIN pagamentos p ON j.id = p.jogo_id
GROUP BY j.id, j.data
ORDER BY j.data DESC;

-- Sair do SQLite
.quit
```

## 📱 Funcionalidades

### 1. Gestão de Jogos

- **Criar novo jogo:** Clique em "Novo Jogo", selecione a data e adicione os jogadores
- **Visualizar jogos:** Jogos futuros aparecem primeiro, seguidos dos passados
- **Acessar detalhes:** Toque em qualquer card de jogo para ver detalhes

### 2. Gestão de Pagamentos

- **Marcar como Pago:** Toque no botão "❌ Devendo" para mudar para "✅ Pago"
- **Marcar como Devendo:** Toque no botão "✅ Pago" para mudar para "❌ Devendo"
- **Adicionar jogador:** Use o campo no topo da lista de jogadores
- **Remover jogador:** Clique no ícone 🗑️ ao lado do jogador

### 3. Controle de Débitos

- **Visualização por jogo:** Cada card mostra total, pagos e devendo
- **Barra de progresso:** Indica percentual de pagamentos
- **Resumo detalhado:** Na tela de detalhes, veja estatísticas completas

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- Vite
- CSS3 (Tema Escuro)
- Axios (HTTP Client)

### Backend
- Node.js 18
- Express.js
- SQLite3
- CORS

### Infraestrutura
- Docker
- Docker Compose
- Nginx (servindo frontend)

## 📂 Estrutura do Projeto

```
RachaPay/
├── backend/
│   ├── data/              # Banco de dados SQLite (criado automaticamente)
│   ├── server.js          # Servidor Express
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 🔧 Comandos Úteis

### Parar os containers
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f
```

### Reconstruir após mudanças
```bash
docker-compose up --build
```

### Limpar tudo (incluindo banco de dados)
```bash
docker-compose down -v
rm -rf backend/data/*.db
```

## 📝 Notas Importantes

- O valor fixo por jogador é **R$ 5,00**
- Não há sistema de autenticação (uso pessoal/privado)
- O banco de dados persiste em `./backend/data/rachapay.db`
- A aplicação é otimizada para mobile, mas funciona em desktop
- Todos os dados são armazenados localmente no banco SQLite

## 🐛 Solução de Problemas

### Porta já em uso
Se a porta 5051 ou 3000 estiver em uso, edite o `docker-compose.yml` e altere as portas.

### Banco de dados não persiste
Certifique-se de que a pasta `backend/data` existe e tem permissões de escrita.

### Erro ao conectar ao backend
Verifique se o container do backend está rodando:
```bash
docker-compose ps
```

## 📄 Licença

Uso pessoal/privado.

---

Desenvolvido com foco em simplicidade e usabilidade para controle semanal de peladas! ⚽

