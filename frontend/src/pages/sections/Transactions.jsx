import { useEffect, useState } from 'react'
import api from '../../api/client'
import Section from './Section'

export default function Transactions() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get('/transactions/')
        setData(res)
      } catch (err) {
        setError('Не удалось загрузить операции')
      }
    }
    load()
  }, [])

  return (
    <Section title="Операции">
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
