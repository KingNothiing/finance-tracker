import { useEffect, useState } from 'react'
import api from '../../api/client'
import Section from './Section'

export default function Accounts() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')

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

  return (
    <Section title="Счета">
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
