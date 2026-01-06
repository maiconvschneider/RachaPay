import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const handleSenhaChange = (e) => {
    const valor = e.target.value
    // Aceita apenas números
    if (valor === '' || /^\d+$/.test(valor)) {
      setSenha(valor)
      setErro('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErro('')

    if (usuario.trim() === '') {
      setErro('Por favor, informe o usuário')
      return
    }

    if (senha === '') {
      setErro('Por favor, informe a senha')
      return
    }

    if (usuario === 'admin' && senha === '624266') {
      onLogin()
    } else {
      setErro('Usuário ou senha incorretos')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <h1>⚽ RachaPay</h1>
          <p className="login-subtitle">Controle de Peladas</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="usuario">Usuário</label>
            <input
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value)
                setErro('')
              }}
              placeholder="Digite seu usuário"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="text"
              id="senha"
              value={senha}
              onChange={handleSenhaChange}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          {erro && (
            <div className="login-erro">
              {erro}
            </div>
          )}

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
