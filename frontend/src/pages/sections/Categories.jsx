import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import PieChart from '../../components/PieChart'
import { currentMonth } from '../../utils/date'
import Section from './Section'

const iconOptions = ['🍔', '☕', '🛒', '🎮', '🚌', '🎁', '🩺', '👨‍👩‍👧‍👦']
const baseCategories = [
  { name: 'Продукты', icon: '🍔' },
  { name: 'Кафе', icon: '☕' },
  { name: 'Покупки', icon: '🛒' },
  { name: 'Досуг', icon: '🎮' },
  { name: 'Транспорт', icon: '🚌' },
  { name: 'Подарки', icon: '🎁' },
  { name: 'Здоровье', icon: '🩺' },
  { name: 'Семья', icon: '👨‍👩‍👧‍👦' },
]

export default function Categories() {
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('')
  const [catColor, setCatColor] = useState('')
  const [defaultAccountId, setDefaultAccountId] = useState('')
  const [accounts, setAccounts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editDefaultAccountId, setEditDefaultAccountId] = useState('')
  const [txCategoryId, setTxCategoryId] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txDate, setTxDate] = useState('')
  const [txAccountId, setTxAccountId] = useState('')
  const [txNote, setTxNote] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [stats, cats, accs] = await Promise.all([
          api.get('/analytics/categories/', {
            params: { month: currentMonth() },
          }),
          api.get('/categories/'),
          api.get('/accounts/'),
        ])
        setData(stats.data)
        setCategories(cats.data)
        setAccounts(accs.data)
      } catch (err) {
        setError('Не удалось загрузить статистику')
      }
    }
    load()
  }, [])

  const createCategory = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        name: catName,
        icon: catIcon,
        color: catColor,
      }
      if (defaultAccountId) {
        payload.default_account_id = defaultAccountId
      }
      const { data: created } = await api.post('/categories/', payload)
      setCategories((prev) => [created, ...prev])
      setCatName('')
      setCatIcon('')
      setCatColor('')
      setDefaultAccountId('')
    } catch (err) {
      setError('Не удалось создать категорию')
    }
  }

  const seedDefaults = async () => {
    setError('')
    try {
      const existing = new Set(categories.map((c) => c.name.toLowerCase()))
      for (const item of baseCategories) {
        if (!existing.has(item.name.toLowerCase())) {
          const { data: created } = await api.post('/categories/', {
            name: item.name,
            icon: item.icon,
            color: '',
          })
          setCategories((prev) => [created, ...prev])
        }
      }
    } catch (err) {
      setError('Не удалось добавить базовые категории')
    }
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditIcon(cat.icon || '')
    setEditColor(cat.color || '')
    setEditDefaultAccountId(cat.default_account_id || '')
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        name: editName,
        icon: editIcon,
        color: editColor,
        default_account_id: editDefaultAccountId || null,
      }
      const { data: updated } = await api.patch(`/categories/${editingId}/`, payload)
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setEditingId(null)
    } catch (err) {
      setError('Не удалось обновить категорию')
    }
  }

  const remove = async (id) => {
    setError('')
    try {
      await api.delete(`/categories/${id}/`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError('Не удалось удалить категорию')
    }
  }

  const createTransaction = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        amount: txAmount,
        date: txDate,
        type: 'expense',
      }
      if (txCategoryId) payload.category_id = txCategoryId
      if (txAccountId) payload.account_id = txAccountId
      if (txNote) payload.note = txNote
      await api.post('/transactions/', payload)
      setTxAmount('')
      setTxDate('')
      setTxAccountId('')
      setTxCategoryId('')
      setTxNote('')
      const { data: stats } = await api.get('/analytics/categories/', {
        params: { month: currentMonth() },
      })
      setData(stats)
    } catch (err) {
      setError('Не удалось добавить трату')
    }
  }

  const ringItems = useMemo(() => {
    if (categories.length === 0) return []
    const radius = 140
    const center = 160
    return categories.map((cat, index) => {
      const angle = (index / categories.length) * 2 * Math.PI
      const x = center + radius * Math.cos(angle)
      const y = center + radius * Math.sin(angle)
      return { cat, x, y }
    })
  }, [categories])

  return (
    <Section title="Категории">
      <p>Кольцевая диаграмма по категориям (месяц).</p>
      <form onSubmit={createCategory} style={{ marginBottom: 12 }}>
        <div className="field">
          <label htmlFor="cat-name">Название категории</label>
          <input
            id="cat-name"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="cat-icon">Иконка</label>
          <select
            id="cat-icon"
            value={catIcon}
            onChange={(e) => setCatIcon(e.target.value)}
          >
            <option value="">Не выбрана</option>
            {iconOptions.map((ico) => (
              <option key={ico} value={ico}>
                {ico}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cat-color">Цвет</label>
          <input
            id="cat-color"
            type="color"
            value={catColor || '#f0e6d7'}
            onChange={(e) => setCatColor(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="cat-account">Счет по умолчанию</label>
          <select
            id="cat-account"
            value={defaultAccountId}
            onChange={(e) => setDefaultAccountId(e.target.value)}
          >
            <option value="">Не задан</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn" type="submit">
          Добавить категорию
        </button>
      </form>
      <button className="btn secondary" type="button" onClick={seedDefaults}>
        Добавить базовые категории
      </button>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="circle-wrap">
          {data.length > 0 && (
            <PieChart
              data={data.map((row, idx) => {
                const cat = categories.find((c) => c.id === row.category_id)
                return {
                  id: row.category_id || idx,
                  value: row.total,
                  color: cat?.color,
                  label: cat?.name || 'Без категории',
                }
              })}
            />
          )}
          {ringItems.map((item) => (
            <div
              key={item.cat.id}
              className="category-node"
              style={{ left: item.x, top: item.y }}
            >
              <span
                className="legend-dot"
                style={{ background: item.cat.color || '#ccc' }}
              />
              <span>
                {item.cat.icon ? `${item.cat.icon} ` : ''}
                {item.cat.name}
              </span>
            </div>
          ))}
        </div>
        <div>
          {error && <p>{error}</p>}
          {data.length === 0 && !error && <p>Нет данных за месяц</p>}
          {data.length > 0 && (
            <ul>
              {data.map((row, idx) => {
                const cat = categories.find((c) => c.id === row.category_id)
                return (
                  <li key={row.category_id || idx}>
                    {cat?.name || 'Без категории'} — {row.total} (
                    {row.percent.toFixed(1)}%)
                  </li>
                )
              })}
            </ul>
          )}
          {data.length > 0 && (
            <div className="legend">
              {data.map((row, idx) => {
                const cat = categories.find((c) => c.id === row.category_id)
                return (
                  <div className="legend-item" key={row.category_id || idx}>
                    <span
                      className="legend-dot"
                      style={{ background: cat?.color || '#ccc' }}
                    />
                    <span>
                      {cat?.icon ? `${cat.icon} ` : ''}
                      {cat?.name || 'Без категории'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <h3>Добавить трату</h3>
      <form onSubmit={createTransaction} style={{ marginBottom: 12 }}>
        <div className="field">
          <label htmlFor="tx-amount">Сумма</label>
          <input
            id="tx-amount"
            type="number"
            step="0.01"
            value={txAmount}
            onChange={(e) => setTxAmount(e.target.value)}
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
          <label htmlFor="tx-category">Категория</label>
          <select
            id="tx-category"
            value={txCategoryId}
            onChange={(e) => setTxCategoryId(e.target.value)}
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
          <label htmlFor="tx-account">Счет</label>
          <select
            id="tx-account"
            value={txAccountId}
            onChange={(e) => setTxAccountId(e.target.value)}
          >
            <option value="">Не выбран (из категории)</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="tx-note">Комментарий</label>
          <input
            id="tx-note"
            value={txNote}
            onChange={(e) => setTxNote(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">
          Добавить трату
        </button>
      </form>
      <h3>Категории</h3>
      {categories.length === 0 && !error && <p>Категорий пока нет</p>}
      {categories.length > 0 && (
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>
              {editingId === cat.id ? (
                <form onSubmit={saveEdit}>
                  <div className="field">
                    <label htmlFor={`cat-name-${cat.id}`}>Название</label>
                    <input
                      id={`cat-name-${cat.id}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`cat-icon-${cat.id}`}>Иконка</label>
                    <select
                      id={`cat-icon-${cat.id}`}
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                    >
                      <option value="">Не выбрана</option>
                      {iconOptions.map((ico) => (
                        <option key={ico} value={ico}>
                          {ico}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`cat-color-${cat.id}`}>Цвет</label>
                    <input
                      id={`cat-color-${cat.id}`}
                      type="color"
                      value={editColor || '#f0e6d7'}
                      onChange={(e) => setEditColor(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`cat-acc-${cat.id}`}>Счет по умолчанию</label>
                    <select
                      id={`cat-acc-${cat.id}`}
                      value={editDefaultAccountId}
                      onChange={(e) => setEditDefaultAccountId(e.target.value)}
                    >
                      <option value="">Не задан</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
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
                  <span className="tag">
                    <span
                      className="legend-dot"
                      style={{ background: cat.color || '#ccc' }}
                    />
                    {cat.icon ? `${cat.icon} ` : ''}
                    {cat.name}
                  </span>
                  {cat.default_account_id && (
                    <span style={{ marginLeft: 8 }}>
                      Счет по умолчанию: {cat.default_account_id}
                    </span>
                  )}
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => startEdit(cat)}
                    style={{ marginLeft: 8 }}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => remove(cat.id)}
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
