import { useState, useEffect } from 'react'
import axios from 'axios'
import './DebitosPorJogador.css'

function DebitosPorJogador({ onClose, onAbrirJogo, apiUrl }) {
  const [debitos, setDebitos] = useState([])
  const [loading, setLoading] = useState(true)
  const [jogadorSelecionado, setJogadorSelecionado] = useState(null)
  const [detalhesJogador, setDetalhesJogador] = useState(null)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)

  useEffect(() => {
    carregarDebitos()
  }, [])

  const carregarDebitos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/debitos`)
      setDebitos(response.data)
    } catch (error) {
      console.error('Erro ao carregar débitos:', error)
      alert('Erro ao carregar débitos. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const handleJogadorClick = async (jogadorNome) => {
    try {
      setLoadingDetalhes(true)
      const response = await axios.get(`${apiUrl}/debitos/${encodeURIComponent(jogadorNome)}`)
      setDetalhesJogador(response.data)
      setJogadorSelecionado(jogadorNome)
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error)
      alert('Erro ao carregar detalhes do jogador.')
    } finally {
      setLoadingDetalhes(false)
    }
  }

  const handleVoltarLista = () => {
    setJogadorSelecionado(null)
    setDetalhesJogador(null)
  }

  const formatarData = (dataStr) => {
    const data = new Date(dataStr + 'T00:00:00')
    return data.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="debitos-container">
        <div className="loading">Carregando débitos...</div>
      </div>
    )
  }

  if (jogadorSelecionado && detalhesJogador) {
    return (
      <div className="debitos-container">
        <header className="debitos-header">
          <button className="btn-voltar" onClick={handleVoltarLista}>
            ← Voltar
          </button>
          <h1>Débitos de {detalhesJogador.jogador_nome}</h1>
        </header>

        <main className="debitos-main">
          <div className="resumo-jogador-card">
            <div className="resumo-item-grande">
              <span className="resumo-label-grande">Total Devendo</span>
              <span className="resumo-value-grande">
                R$ {detalhesJogador.valor_total.toFixed(2)}
              </span>
            </div>
            <div className="resumo-item-grande">
              <span className="resumo-label-grande">Jogos Devendo</span>
              <span className="resumo-value-grande">
                {detalhesJogador.total_jogos}
              </span>
            </div>
          </div>

          <div className="jogos-devendo-section">
            <h3 className="section-title-jogos">Jogos em Débito</h3>
            {detalhesJogador.jogos.length === 0 ? (
              <div className="empty-jogos">
                <p>Nenhum jogo em débito.</p>
              </div>
            ) : (
              <div className="jogos-devendo-list">
                {detalhesJogador.jogos.map((jogo, index) => (
                  <div key={index} className="jogo-devendo-item">
                    <div className="jogo-devendo-info">
                      <span className="jogo-devendo-data">
                        {formatarData(jogo.data)}
                      </span>
                      <span className="jogo-devendo-valor">R$ 5,00</span>
                    </div>
                    <button
                      className="btn-abrir-jogo"
                      onClick={() => {
                        if (onAbrirJogo) {
                          onAbrirJogo(jogo.jogo_id)
                        }
                      }}
                    >
                      Ver Jogo →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="debitos-container">
      <header className="debitos-header">
        <button className="btn-voltar" onClick={onClose}>
          ← Voltar
        </button>
        <h1>Débitos por Jogador</h1>
      </header>

      <main className="debitos-main">
        {debitos.length === 0 ? (
          <div className="empty-debitos">
            <p>🎉 Nenhum débito pendente!</p>
            <p>Todos os jogadores estão em dia.</p>
          </div>
        ) : (
          <div className="debitos-list">
            {debitos.map((debito, index) => (
              <div
                key={index}
                className="debito-card"
                onClick={() => handleJogadorClick(debito.jogador_nome)}
              >
                <div className="debito-card-header">
                  <h3 className="jogador-nome-debito">{debito.jogador_nome}</h3>
                  <span className="badge-jogos">
                    {debito.total_jogos_devendo} {debito.total_jogos_devendo === 1 ? 'jogo' : 'jogos'}
                  </span>
                </div>
                <div className="debito-card-body">
                  <div className="valor-devendo">
                    <span className="label-valor">Total Devendo:</span>
                    <span className="valor-total-devendo">
                      R$ {parseFloat(debito.valor_total_devendo).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="debito-card-footer">
                  <span className="tap-hint">Toque para ver detalhes →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default DebitosPorJogador

