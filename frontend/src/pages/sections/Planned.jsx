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
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLink, setEditLink] = useState('')

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

  const startEdit = (pp) => {
    setEditingId(pp.id)
    setEditName(pp.name)
    setEditPrice(pp.price)
    setEditDescription(pp.description || '')
    setEditLink(pp.link || '')
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data: updated } = await api.patch(`/planned-purchases/${editingId}/`, {
        name: editName,
        price: editPrice,
        description: editDescription,
        link: editLink,
      })
      setData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setEditingId(null)
    } catch (err) {
      setError('Не удалось обновить покупку')
    }
  }

  const remove = async (id) => {
    setError('')
    try {
      await api.delete(`/planned-purchases/${id}/`)
      setData((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError('Не удалось удалить покупку')
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
              {editingId === pp.id ? (
                <form onSubmit={saveEdit}>
                  <div className="field">
                    <label htmlFor={`pp-name-${pp.id}`}>Название</label>
                    <input
                      id={`pp-name-${pp.id}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`pp-price-${pp.id}`}>Цена</label>
                    <input
                      id={`pp-price-${pp.id}`}
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`pp-desc-${pp.id}`}>Описание</label>
                    <input
                      id={`pp-desc-${pp.id}`}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`pp-link-${pp.id}`}>Ссылка</label>
                    <input
                      id={`pp-link-${pp.id}`}
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
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
                  {pp.name} — {pp.price}
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => startEdit(pp)}
                    style={{ marginLeft: 8 }}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => remove(pp.id)}
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
