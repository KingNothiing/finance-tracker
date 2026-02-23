import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Accounts from './sections/Accounts'
import Expenses from './sections/Expenses'
import Overview from './sections/Overview'
import Planned from './sections/Planned'
import Transactions from './sections/Transactions'

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
          <Link to="expenses">Траты</Link>
          <Link to="accounts">Счета</Link>
          <Link to="transactions">Операции</Link>
          <Link to="overview">Обзор</Link>
          <Link to="planned">Покупки</Link>
          <button className="btn secondary" onClick={logout} type="button">
            Выйти
          </button>
        </div>

        <Routes>
          <Route index element={<Expenses />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="overview" element={<Overview />} />
          <Route path="planned" element={<Planned />} />
        </Routes>
      </div>
    </div>
  )
}
