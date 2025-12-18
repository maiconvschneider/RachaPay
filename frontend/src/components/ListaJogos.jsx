import { useState, useEffect } from 'react'
import axios from 'axios'
import JogoCard from './JogoCard'
import './ListaJogos.css'

function ListaJogos({ tipo, onClose, onAbrirJogo, apiUrl }) {
  const [jogos, setJogos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarJogos()
  }, [])

  const carregarJogos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/jogos`)
      const hoje = new Date().toISOString().split('T')[0]
      
      let jogosFiltrados = []
      if (tipo === 'passados') {
        jogosFiltrados = response.data
          .filter(j => j.data < hoje)
          .sort((a, b) => b.data.localeCompare(a.data))
      } else if (tipo === 'futuros') {
        jogosFiltrados = response.data
          .filter(j => j.data >= hoje)
          .sort((a, b) => a.data.localeCompare(b.data))
      }
      
      setJogos(jogosFiltrados)
    } catch (error) {
      console.error('Erro ao carregar jogos:', error)
      alert('Erro ao carregar jogos. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const titulo = tipo === 'passados' ? 'Jogos Passados' : 'Jogos Futuros'

  if (loading) {
    return (
      <div className="lista-jogos-container">
        <div className="loading">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="lista-jogos-container">
      <header className="lista-jogos-header">
        <button className="btn-voltar" onClick={onClose}>
          ← Voltar
        </button>
        <h1>{titulo}</h1>
      </header>

      <main className="lista-jogos-main">
        {jogos.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum jogo {tipo === 'passados' ? 'passado' : 'futuro'} cadastrado.</p>
          </div>
        ) : (
          <div className="jogos-grid">
            {jogos.map(jogo => (
              <JogoCard
                key={jogo.id}
                jogo={jogo}
                onClick={() => onAbrirJogo(jogo.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ListaJogos

