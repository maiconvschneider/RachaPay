import { useState } from 'react'
import axios from 'axios'
import './NovoJogoModal.css'

function NovoJogoModal({ onClose, onSuccess, apiUrl }) {
  const [data, setData] = useState('')
  const [jogadores, setJogadores] = useState([''])
  const [loading, setLoading] = useState(false)

  const adicionarJogador = () => {
    setJogadores([...jogadores, ''])
  }

  const removerJogador = (index) => {
    if (jogadores.length > 1) {
      setJogadores(jogadores.filter((_, i) => i !== index))
    }
  }

  const atualizarJogador = (index, valor) => {
    const novosJogadores = [...jogadores]
    novosJogadores[index] = valor
    setJogadores(novosJogadores)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const jogadoresFiltrados = jogadores.filter(j => j.trim() !== '')
    
    if (!data) {
      alert('Por favor, selecione uma data')
      return
    }

    if (jogadoresFiltrados.length === 0) {
      alert('Adicione pelo menos um jogador')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${apiUrl}/jogos`, {
        data,
        jogadores: jogadoresFiltrados
      })
      onSuccess()
    } catch (error) {
      console.error('Erro ao criar jogo:', error)
      alert('Erro ao criar jogo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Jogo</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="data">Data do Jogo</label>
            <input
              type="date"
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Jogadores</label>
            <div className="jogadores-list">
              {jogadores.map((jogador, index) => (
                <div key={index} className="jogador-input-row">
                  <input
                    type="text"
                    placeholder={`Jogador ${index + 1}`}
                    value={jogador}
                    onChange={(e) => atualizarJogador(index, e.target.value)}
                    required={index === 0}
                  />
                  {jogadores.length > 1 && (
                    <button
                      type="button"
                      className="btn-remover"
                      onClick={() => removerJogador(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-adicionar-jogador"
              onClick={adicionarJogador}
            >
              + Adicionar Jogador
            </button>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-salvar"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Jogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NovoJogoModal

