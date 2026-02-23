import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import Section from './Section'

export default function Operations() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])

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

  const grouped = useMemo(() => {
    const map = new Map()
    data.forEach((tx) => {
      const key = tx.date
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(tx)
    })
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [data])

  return (
    <Section title="Операции">
      {error && <p>{error}</p>}
      {data.length === 0 && !error && <p>Операций пока нет</p>}
      {data.length > 0 && (
        <ul>
          {grouped.map(([day, items]) => (
            <li key={day}>
              <strong>{day}</strong>
              <ul>
                {items.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.category_id)
                  const acc = accounts.find((a) => a.id === tx.account_id)
                  return (
                    <li key={tx.id}>
                      {cat?.icon ? `${cat.icon} ` : ''}
                      {cat?.name || 'Без категории'} — {tx.amount} —{' '}
                      {acc?.name || 'Счет не найден'}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
