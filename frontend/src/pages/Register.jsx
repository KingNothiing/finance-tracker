import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/register/', { email, password })
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      navigate('/app')
    } catch (err) {
      setError('Не удалось зарегистрироваться')
    }
  }

  return (
    <div className="page">
      <form className="card" onSubmit={submit}>
        <h1>Регистрация</h1>
        <p>Создайте аккаунт</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button className="btn" type="submit">
          Зарегистрироваться
        </button>
        <div style={{ marginTop: 12 }}>
          <Link to="/login">Уже есть аккаунт? Войти</Link>
        </div>
      </form>
    </div>
  )
}
