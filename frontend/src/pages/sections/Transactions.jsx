import { useEffect, useState } from 'react'
import api from '../../api/client'
import Section from './Section'

export default function Transactions() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [txDate, setTxDate] = useState('')
  const [type, setType] = useState('expense')
  const [note, setNote] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [tx, accs, cats] = await Promise.all([
          api.get('/transactions/'),
          api.get('/accounts/'),
          api.get('/categories/'),
        ])
        setData(tx.data)
        setAccounts(accs.data)
        setCategories(cats.data)
      } catch (err) {
        setError('Не удалось загрузить операции')
      }
    }
    load()
  }, [])

  const create = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        amount,
        date: txDate,
        type,
      }
      if (accountId) payload.account_id = accountId
      if (categoryId) payload.category_id = categoryId
      if (note) payload.note = note
      const { data: created } = await api.post('/transactions/', payload)
      setData((prev) => [created, ...prev])
      setAmount('')
      setTxDate('')
      setType('expense')
      setNote('')
      setAccountId('')
      setCategoryId('')
    } catch (err) {
      setError('Не удалось создать операцию')
    }
  }

  return (
    <Section title="Операции">
      <form onSubmit={create} style={{ marginBottom: 12 }}>
        <div className="field">
          <label htmlFor="tx-amount">Сумма</label>
          <input
            id="tx-amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="tx-date">Дата</label>
          <input
            id="tx-date"
            type="date"
            value={txDate}
            onChange={(e) => setTxDate(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="tx-type">Тип</label>
          <select
            id="tx-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="tx-account">Счет</label>
          <select
            id="tx-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">Не выбран (возьмем из категории)</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tx-category">Категория</label>
          <select
            id="tx-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Не выбрана</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tx-note">Комментарий</label>
          <input
            id="tx-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">
          Добавить операцию
        </button>
      </form>
      {error && <p>{error}</p>}
      {data.length === 0 && !error && <p>Операций пока нет</p>}
      {data.length > 0 && (
        <ul>
          {data.map((tx) => (
            <li key={tx.id}>
              {tx.date} — {tx.type} — {tx.amount}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
