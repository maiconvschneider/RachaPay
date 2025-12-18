import './JogoCard.css'

function JogoCard({ jogo, onClick }) {
  const formatarData = (dataStr) => {
    const data = new Date(dataStr + 'T00:00:00')
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(hoje.getDate() + 1)
    
    const dataFormatada = data.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje - ${dataFormatada}`
    } else if (data.toDateString() === amanha.toDateString()) {
      return `Amanhã - ${dataFormatada}`
    }
    
    return dataFormatada
  }

  const totalJogadores = parseInt(jogo.total_jogadores) || 0
  const pagos = parseInt(jogo.pagos) || 0
  const devendo = parseInt(jogo.devendo) || 0
  const percentualPago = totalJogadores > 0 ? Math.round((pagos / totalJogadores) * 100) : 0

  return (
    <div className="jogo-card" onClick={onClick}>
      <div className="jogo-card-header">
        <h3 className="jogo-data">{formatarData(jogo.data)}</h3>
        <div className="jogo-status-badge">
          {percentualPago === 100 ? '✅' : '⏳'}
        </div>
      </div>
      
      <div className="jogo-stats">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{totalJogadores}</span>
        </div>
        <div className="stat-item stat-pago">
          <span className="stat-label">Pagos:</span>
          <span className="stat-value">{pagos}</span>
        </div>
        <div className="stat-item stat-devendo">
          <span className="stat-label">Devendo:</span>
          <span className="stat-value">{devendo}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentualPago}%` }}
        />
      </div>

      <div className="jogo-card-footer">
        <span className="valor-total">R$ {(totalJogadores * 5).toFixed(2)}</span>
        <span className="tap-hint">Toque para ver detalhes →</span>
      </div>
    </div>
  )
}

export default JogoCard

