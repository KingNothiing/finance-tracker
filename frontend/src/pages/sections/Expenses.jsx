import { useEffect, useState } from 'react'
import api from '../../api/client'
import { currentMonth } from '../../utils/date'
import Section from './Section'

export default function Expenses() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get('/analytics/categories/', {
          params: { month: currentMonth() },
        })
        setData(res)
      } catch (err) {
        setError('Не удалось загрузить статистику')
      }
    }
    load()
  }, [])

  return (
    <Section title="Траты">
      <p>Кольцевая диаграмма по категориям (месяц).</p>
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
    </Section>
  )
}
