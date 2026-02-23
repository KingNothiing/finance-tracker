import { useEffect, useState } from 'react'
import api from '../../api/client'
import { currentMonth } from '../../utils/date'
import Section from './Section'

export default function Expenses() {
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('')
  const [catColor, setCatColor] = useState('')
  const [defaultAccountId, setDefaultAccountId] = useState('')
  const [accounts, setAccounts] = useState([])

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

  return (
    <Section title="Траты">
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
          <input
            id="cat-icon"
            value={catIcon}
            onChange={(e) => setCatIcon(e.target.value)}
            placeholder="например: 🍔"
          />
        </div>
        <div className="field">
          <label htmlFor="cat-color">Цвет</label>
          <input
            id="cat-color"
            value={catColor}
            onChange={(e) => setCatColor(e.target.value)}
            placeholder="#ff9900"
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
      {error && <p>{error}</p>}
      {data.length === 0 && !error && <p>Нет данных за месяц</p>}
      {data.length > 0 && (
        <ul>
          {data.map((row) => (
            <li key={row.category_id}>
              Категория: {row.category_id} — {row.total} ({row.percent.toFixed(1)}%)
            </li>
          ))}
        </ul>
      )}
      <h3>Категории</h3>
      {categories.length === 0 && !error && <p>Категорий пока нет</p>}
      {categories.length > 0 && (
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>
              {cat.name} {cat.icon} {cat.color}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
