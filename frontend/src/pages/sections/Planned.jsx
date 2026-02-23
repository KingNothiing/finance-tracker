import { useEffect, useState } from 'react'
import api from '../../api/client'
import Section from './Section'

export default function Planned() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')

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

  const create = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data: created } = await api.post('/planned-purchases/', {
        name,
        price,
        description,
        link,
      })
      setData((prev) => [created, ...prev])
      setName('')
      setPrice('')
      setDescription('')
      setLink('')
    } catch (err) {
      setError('Не удалось создать покупку')
    }
  }

  return (
    <Section title="Запланированные покупки">
      <form onSubmit={create} style={{ marginBottom: 12 }}>
        <div className="field">
          <label htmlFor="pp-name">Название</label>
          <input
            id="pp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pp-price">Цена</label>
          <input
            id="pp-price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pp-desc">Описание</label>
          <input
            id="pp-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="pp-link">Ссылка</label>
          <input
            id="pp-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">
          Добавить покупку
        </button>
      </form>
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
