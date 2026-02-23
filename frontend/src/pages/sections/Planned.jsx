import { useEffect, useState } from 'react'
import api from '../../api/client'
import Section from './Section'

export default function Planned() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get('/planned-purchases/')
        setData(res)
      } catch (err) {
        setError('Не удалось загрузить покупки')
      }
    }
    load()
  }, [])

  return (
    <Section title="Запланированные покупки">
      {error && <p>{error}</p>}
      {data.length === 0 && !error && <p>Покупок пока нет</p>}
      {data.length > 0 && (
        <ul>
          {data.map((pp) => (
            <li key={pp.id}>
              {pp.name} — {pp.price}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
