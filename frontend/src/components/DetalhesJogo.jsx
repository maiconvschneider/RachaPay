import { useState, useEffect } from 'react'
import axios from 'axios'
import './DetalhesJogo.css'

function DetalhesJogo({ jogo, onClose, onUpdate, onDelete, apiUrl }) {
  const [jogadores, setJogadores] = useState([])
  const [novoJogador, setNovoJogador] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setJogadores(jogo.jogadores || [])
  }, [jogo])

  const formatarData = (dataStr) => {
    const data = new Date(dataStr + 'T00:00:00')
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const toggleStatus = async (jogadorNome, novoStatus) => {
    try {
      setLoading(true)
      await axios.put(`${apiUrl}/jogos/${jogo.id}/jogadores/${encodeURIComponent(jogadorNome)}`, {
        status: novoStatus
      })
      
      setJogadores(jogadores.map(j => 
        j.jogador_nome === jogadorNome 
          ? { ...j, status: novoStatus }
          : j
      ))
      onUpdate()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const adicionarJogador = async (e) => {
    e.preventDefault()
    if (!novoJogador.trim()) return

    try {
      setLoading(true)
      await axios.post(`${apiUrl}/jogos/${jogo.id}/jogadores`, {
        nome: novoJogador.trim(),
        status: 'devendo'
      })
      
      setJogadores([...jogadores, {
        jogador_nome: novoJogador.trim(),
        status: 'devendo'
      }])
      setNovoJogador('')
      onUpdate()
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error)
      alert(error.response?.data?.error || 'Erro ao adicionar jogador. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const removerJogador = async (jogadorNome) => {
    if (!confirm(`Deseja remover ${jogadorNome} deste jogo?`)) return

    try {
      setLoading(true)
      await axios.delete(`${apiUrl}/jogos/${jogo.id}/jogadores/${encodeURIComponent(jogadorNome)}`)
      
      setJogadores(jogadores.filter(j => j.jogador_nome !== jogadorNome))
      onUpdate()
    } catch (error) {
      console.error('Erro ao remover jogador:', error)
      alert('Erro ao remover jogador. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const deletarJogo = async () => {
    const confirmacao = confirm(
      `Tem certeza que deseja excluir este jogo?\n\nData: ${formatarData(jogo.data)}\nJogadores: ${jogadores.length}\n\nEsta ação não pode ser desfeita!`
    )
    
    if (!confirmacao) return

    try {
      setLoading(true)
      await axios.delete(`${apiUrl}/jogos/${jogo.id}`)
      
      if (onDelete) {
        onDelete()
      } else {
        onClose()
      }
    } catch (error) {
      console.error('Erro ao deletar jogo:', error)
      alert('Erro ao deletar jogo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const pagos = jogadores.filter(j => j.status === 'pago').length
  const devendo = jogadores.filter(j => j.status === 'devendo').length
  const total = jogadores.length
  const percentualPago = total > 0 ? Math.round((pagos / total) * 100) : 0

  return (
    <div className="detalhes-jogo">
      <header className="detalhes-header">
        <button className="btn-voltar" onClick={onClose}>
          ← Voltar
        </button>
        <h1>Detalhes do Jogo</h1>
      </header>

      <main className="detalhes-main">
        <div className="jogo-info-card">
          <h2 className="jogo-data-completa">{formatarData(jogo.data)}</h2>
          <div className="jogo-resumo">
            <div className="resumo-item">
              <span className="resumo-label">Total de Jogadores</span>
              <span className="resumo-value">{total}</span>
            </div>
            <div className="resumo-item resumo-pago">
              <span className="resumo-label">Pagos</span>
              <span className="resumo-value">{pagos}</span>
            </div>
            <div className="resumo-item resumo-devendo">
              <span className="resumo-label">Devendo</span>
              <span className="resumo-value">{devendo}</span>
            </div>
            <div className="resumo-item resumo-valor">
              <span className="resumo-label">Valor Total</span>
              <span className="resumo-value">R$ {(total * 5).toFixed(2)}</span>
            </div>
          </div>
          <div className="progress-bar-large">
            <div 
              className="progress-fill-large"
              style={{ width: `${percentualPago}%` }}
            />
            <span className="progress-text">{percentualPago}% pago</span>
          </div>
        </div>

        <div className="adicionar-jogador-section">
          <form onSubmit={adicionarJogador} className="form-adicionar">
            <input
              type="text"
              placeholder="Nome do jogador"
              value={novoJogador}
              onChange={(e) => setNovoJogador(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !novoJogador.trim()}>
              + Adicionar
            </button>
          </form>
        </div>

        <div className="acoes-jogo-section">
          <button
            className="btn-deletar-jogo"
            onClick={deletarJogo}
            disabled={loading}
          >
            🗑️ Excluir Jogo
          </button>
        </div>

        <div className="jogadores-section">
          <h3 className="section-title-jogadores">Jogadores ({total})</h3>
          {jogadores.length === 0 ? (
            <div className="empty-jogadores">
              <p>Nenhum jogador cadastrado ainda.</p>
            </div>
          ) : (
            <div className="jogadores-list">
              {jogadores.map((jogador, index) => (
                <div key={index} className="jogador-item">
                  <div className="jogador-info">
                    <span className="jogador-nome">{jogador.jogador_nome}</span>
                    <span className="jogador-valor">R$ 5,00</span>
                  </div>
                  <div className="jogador-actions">
                    <button
                      className={`btn-status ${jogador.status === 'pago' ? 'btn-pago' : 'btn-devendo'}`}
                      onClick={() => toggleStatus(
                        jogador.jogador_nome,
                        jogador.status === 'pago' ? 'devendo' : 'pago'
                      )}
                      disabled={loading}
                    >
                      {jogador.status === 'pago' ? '✅ Pago' : '❌ Devendo'}
                    </button>
                    <button
                      className="btn-remover-jogador"
                      onClick={() => removerJogador(jogador.jogador_nome)}
                      disabled={loading}
                      title="Remover jogador"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DetalhesJogo

