import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import JogoCard from './components/JogoCard'
import NovoJogoModal from './components/NovoJogoModal'
import DetalhesJogo from './components/DetalhesJogo'
import DebitosPorJogador from './components/DebitosPorJogador'
import ListaJogos from './components/ListaJogos'
import Login from './components/Login'
import { estaNaSemanaAtual } from './utils/dateUtils'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [autenticado, setAutenticado] = useState(false)
  const [jogos, setJogos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNovoJogo, setShowNovoJogo] = useState(false)
  const [jogoSelecionado, setJogoSelecionado] = useState(null)
  const [showDebitos, setShowDebitos] = useState(false)
  const [showListaJogos, setShowListaJogos] = useState(null) // 'passados' ou 'futuros'

  useEffect(() => {
    // Verificar se já está autenticado (salvo no localStorage)
    const authStatus = localStorage.getItem('rachapay_autenticado')
    if (authStatus === 'true') {
      setAutenticado(true)
      carregarJogos()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = () => {
    localStorage.setItem('rachapay_autenticado', 'true')
    setAutenticado(true)
    carregarJogos()
  }

  const carregarJogos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/jogos`)
      setJogos(response.data)
    } catch (error) {
      console.error('Erro ao carregar jogos:', error)
      alert('Erro ao carregar jogos. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const handleJogoCriado = () => {
    setShowNovoJogo(false)
    carregarJogos()
  }

  const handleJogoAtualizado = () => {
    carregarJogos()
    if (jogoSelecionado) {
      carregarDetalhesJogo(jogoSelecionado.id)
    }
  }

  const carregarDetalhesJogo = async (jogoId) => {
    try {
      const response = await axios.get(`${API_URL}/jogos/${jogoId}`)
      setJogoSelecionado(response.data)
    } catch (error) {
      console.error('Erro ao carregar detalhes do jogo:', error)
    }
  }

  const handleAbrirJogo = (jogo) => {
    carregarDetalhesJogo(jogo.id)
  }

  const handleFecharDetalhes = () => {
    setJogoSelecionado(null)
  }

  const handleAbrirDebitos = () => {
    setShowDebitos(true)
  }

  const handleFecharDebitos = () => {
    setShowDebitos(false)
  }

  const handleAbrirListaJogos = (tipo) => {
    setShowListaJogos(tipo)
  }

  const handleFecharListaJogos = () => {
    setShowListaJogos(null)
  }

  const handleJogoDeletado = () => {
    setJogoSelecionado(null)
    carregarJogos()
  }

  // Filtrar jogos da semana atual
  const jogosSemanaAtual = jogos.filter(j => estaNaSemanaAtual(j.data))
    .sort((a, b) => a.data.localeCompare(b.data))

  if (!autenticado) {
    if (loading) {
      return (
        <div className="app">
          <div className="loading">Carregando...</div>
        </div>
      )
    }
    return <Login onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Carregando...</div>
      </div>
    )
  }

  if (showListaJogos) {
    return (
      <ListaJogos
        tipo={showListaJogos}
        onClose={handleFecharListaJogos}
        onAbrirJogo={(jogoId) => {
          handleFecharListaJogos()
          carregarDetalhesJogo(jogoId)
        }}
        apiUrl={API_URL}
      />
    )
  }

  if (showDebitos) {
    return (
      <DebitosPorJogador
        onClose={handleFecharDebitos}
        onAbrirJogo={(jogoId) => {
          handleFecharDebitos()
          carregarDetalhesJogo(jogoId)
        }}
        apiUrl={API_URL}
      />
    )
  }

  if (jogoSelecionado) {
    return (
      <DetalhesJogo
        jogo={jogoSelecionado}
        onClose={handleFecharDetalhes}
        onUpdate={handleJogoAtualizado}
        onDelete={handleJogoDeletado}
        apiUrl={API_URL}
      />
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>⚽ RachaPay</h1>
        <p className="subtitle">Controle de Peladas</p>
      </header>

      <main className="main">
        <div className="botoes-acoes">
          <button 
            className="btn-novo-jogo"
            onClick={() => setShowNovoJogo(true)}
          >
            + Novo Jogo
          </button>
          <button 
            className="btn-debitos"
            onClick={handleAbrirDebitos}
          >
            💰 Débitos
          </button>
        </div>

        <div className="botoes-navegacao">
          <button 
            className="btn-jogos-passados"
            onClick={() => handleAbrirListaJogos('passados')}
          >
            📅 Jogos Passados
          </button>
          <button 
            className="btn-jogos-futuros"
            onClick={() => handleAbrirListaJogos('futuros')}
          >
            📅 Jogos Futuros
          </button>
        </div>

        {jogosSemanaAtual.length > 0 && (
          <section className="section">
            <h2 className="section-title">Semana Atual</h2>
            <div className="jogos-grid">
              {jogosSemanaAtual.map(jogo => (
                <JogoCard
                  key={jogo.id}
                  jogo={jogo}
                  onClick={() => handleAbrirJogo(jogo)}
                />
              ))}
            </div>
          </section>
        )}

        {jogosSemanaAtual.length === 0 && jogos.length > 0 && (
          <div className="empty-state">
            <p>Nenhum jogo na semana atual.</p>
            <p>Use os botões acima para ver jogos passados ou futuros.</p>
          </div>
        )}

        {jogos.length === 0 && (
          <div className="empty-state">
            <p>Nenhum jogo cadastrado ainda.</p>
            <p>Clique em "Novo Jogo" para começar!</p>
          </div>
        )}
      </main>

      {showNovoJogo && (
        <NovoJogoModal
          onClose={() => setShowNovoJogo(false)}
          onSuccess={handleJogoCriado}
          apiUrl={API_URL}
        />
      )}
    </div>
  )
}

export default App

