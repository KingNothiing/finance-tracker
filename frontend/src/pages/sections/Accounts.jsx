import { useEffect, useState } from 'react'
import api from '../../api/client'
import Section from './Section'

export default function Accounts() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('cash')
  const [balance, setBalance] = useState('0')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get('/accounts/')
        setData(res)
      } catch (err) {
        setError('Не удалось загрузить счета')
      }
    }
    load()
  }, [])

  const create = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data: created } = await api.post('/accounts/', {
        name,
        type,
        balance,
      })
      setData((prev) => [created, ...prev])
      setName('')
      setType('cash')
      setBalance('0')
    } catch (err) {
      setError('Не удалось создать счет')
    }
  }

  return (
    <Section title="Счета">
      <form onSubmit={create} style={{ marginBottom: 12 }}>
        <div className="field">
          <label htmlFor="acc-name">Название</label>
          <input
            id="acc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="acc-type">Тип</label>
          <select
            id="acc-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="cash">Наличные</option>
            <option value="card">Карта</option>
            <option value="deposit">Вклад</option>
            <option value="other">Другое</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="acc-balance">Баланс</label>
          <input
            id="acc-balance"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">
          Добавить счет
        </button>
      </form>
      {error && <p>{error}</p>}
      {data.length === 0 && !error && <p>Счетов пока нет</p>}
      {data.length > 0 && (
        <ul>
          {data.map((acc) => (
            <li key={acc.id}>
              {acc.name} — {acc.type} — {acc.balance}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
