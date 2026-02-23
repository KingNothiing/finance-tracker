import { useEffect, useState } from 'react'
import api from '../../api/client'
import { currentMonth } from '../../utils/date'
import Section from './Section'

export default function Overview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get('/analytics/summary/', {
          params: { month: currentMonth() },
        })
        setData(res)
      } catch (err) {
        setError('Не удалось загрузить обзор')
      }
    }
    load()
  }, [])

  return (
    <Section title="Обзор">
      {error && <p>{error}</p>}
      {!data && !error && <p>Загрузка...</p>}
      {data && (
        <ul>
          <li>Расходы: {data.total_expense}</li>
          <li>Доходы: {data.total_income}</li>
          <li>Средние траты в день: {data.avg_daily_expense}</li>
          <li>Сегодня потрачено: {data.today_expense}</li>
        </ul>
      )}
    </Section>
  )
}
