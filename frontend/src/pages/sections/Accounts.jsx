import { useEffect, useState } from 'react'
import api from '../../api/client'
import Section from './Section'

export default function Accounts() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('cash')
  const [balance, setBalance] = useState('0')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('cash')
  const [editBalance, setEditBalance] = useState('0')

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

  const startEdit = (acc) => {
    setEditingId(acc.id)
    setEditName(acc.name)
    setEditType(acc.type)
    setEditBalance(acc.balance)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data: updated } = await api.patch(`/accounts/${editingId}/`, {
        name: editName,
        type: editType,
        balance: editBalance,
      })
      setData((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setEditingId(null)
    } catch (err) {
      setError('Не удалось обновить счет')
    }
  }

  const remove = async (id) => {
    setError('')
    try {
      await api.delete(`/accounts/${id}/`)
      setData((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError('Не удалось удалить счет')
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
              {editingId === acc.id ? (
                <form onSubmit={saveEdit}>
                  <div className="field">
                    <label htmlFor={`acc-name-${acc.id}`}>Название</label>
                    <input
                      id={`acc-name-${acc.id}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`acc-type-${acc.id}`}>Тип</label>
                    <select
                      id={`acc-type-${acc.id}`}
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                    >
                      <option value="cash">Наличные</option>
                      <option value="card">Карта</option>
                      <option value="deposit">Вклад</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`acc-balance-${acc.id}`}>Баланс</label>
                    <input
                      id={`acc-balance-${acc.id}`}
                      type="number"
                      step="0.01"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                    />
                  </div>
                  <button className="btn" type="submit">
                    Сохранить
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setEditingId(null)}
                  >
                    Отмена
                  </button>
                </form>
              ) : (
                <>
                  {acc.name} — {acc.type} — {acc.balance}
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => startEdit(acc)}
                    style={{ marginLeft: 8 }}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => remove(acc.id)}
                    style={{ marginLeft: 8 }}
                  >
                    Удалить
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
