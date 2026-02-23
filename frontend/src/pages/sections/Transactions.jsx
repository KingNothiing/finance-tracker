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
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editType, setEditType] = useState('expense')
  const [editAccountId, setEditAccountId] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editNote, setEditNote] = useState('')

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

  const applyFilters = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const params = {}
      if (filterFrom) params.from = filterFrom
      if (filterTo) params.to = filterTo
      if (filterAccount) params.account_id = filterAccount
      if (filterCategory) params.category_id = filterCategory
      if (filterType) params.type = filterType
      const { data: res } = await api.get('/transactions/', { params })
      setData(res)
    } catch (err) {
      setError('Не удалось применить фильтры')
    }
  }

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

  const startEdit = (tx) => {
    setEditingId(tx.id)
    setEditAmount(tx.amount)
    setEditDate(tx.date)
    setEditType(tx.type)
    setEditAccountId(tx.account_id || '')
    setEditCategoryId(tx.category_id || '')
    setEditNote(tx.note || '')
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        amount: editAmount,
        date: editDate,
        type: editType,
        note: editNote,
      }
      if (editAccountId) payload.account_id = editAccountId
      if (editCategoryId) payload.category_id = editCategoryId
      const { data: updated } = await api.patch(`/transactions/${editingId}/`, payload)
      setData((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setEditingId(null)
    } catch (err) {
      setError('Не удалось обновить операцию')
    }
  }

  const remove = async (id) => {
    setError('')
    try {
      await api.delete(`/transactions/${id}/`)
      setData((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError('Не удалось удалить операцию')
    }
  }

  return (
    <Section title="Операции">
      <form onSubmit={applyFilters} style={{ marginBottom: 12 }}>
        <div className="field">
          <label htmlFor="f-from">С</label>
          <input
            id="f-from"
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="f-to">По</label>
          <input
            id="f-to"
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="f-type">Тип</label>
          <select
            id="f-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Любой</option>
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-account">Счет</label>
          <select
            id="f-account"
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
          >
            <option value="">Любой</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-category">Категория</label>
          <select
            id="f-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Любая</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn" type="submit">
          Применить фильтры
        </button>
      </form>
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
              {editingId === tx.id ? (
                <form onSubmit={saveEdit}>
                  <div className="field">
                    <label htmlFor={`tx-amount-${tx.id}`}>Сумма</label>
                    <input
                      id={`tx-amount-${tx.id}`}
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`tx-date-${tx.id}`}>Дата</label>
                    <input
                      id={`tx-date-${tx.id}`}
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`tx-type-${tx.id}`}>Тип</label>
                    <select
                      id={`tx-type-${tx.id}`}
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                    >
                      <option value="expense">Расход</option>
                      <option value="income">Доход</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`tx-account-${tx.id}`}>Счет</label>
                    <select
                      id={`tx-account-${tx.id}`}
                      value={editAccountId}
                      onChange={(e) => setEditAccountId(e.target.value)}
                    >
                      <option value="">Не выбран</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`tx-category-${tx.id}`}>Категория</label>
                    <select
                      id={`tx-category-${tx.id}`}
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
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
                    <label htmlFor={`tx-note-${tx.id}`}>Комментарий</label>
                    <input
                      id={`tx-note-${tx.id}`}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
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
                  {tx.date} — {tx.type} — {tx.amount}
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => startEdit(tx)}
                    style={{ marginLeft: 8 }}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => remove(tx.id)}
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
