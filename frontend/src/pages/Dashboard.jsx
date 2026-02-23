import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Accounts from './sections/Accounts'
import Categories from './sections/Categories'
import Overview from './sections/Overview'
import Planned from './sections/Planned'
import Operations from './sections/Operations'

export default function Dashboard() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login')
  }

  return (
    <div className="page" style={{ alignItems: 'start' }}>
      <div className="card" style={{ maxWidth: 900 }}>
        <h1>Finance Tracker</h1>
        <div className="nav">
          <Link to="/app/categories">Категории</Link>
          <Link to="/app/accounts">Счета</Link>
          <Link to="/app/operations">Операции</Link>
          <Link to="/app/overview">Обзор</Link>
          <Link to="/app/planned">Покупки</Link>
          <button className="btn secondary" onClick={logout} type="button">
            Выйти
          </button>
        </div>

        <Routes>
          <Route index element={<Categories />} />
          <Route path="categories" element={<Categories />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="operations" element={<Operations />} />
          <Route path="overview" element={<Overview />} />
          <Route path="planned" element={<Planned />} />
        </Routes>
      </div>
    </div>
  )
}
