import { Link, Route, Routes } from 'react-router-dom'

function Section({ title, children }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function Expenses() {
  return (
    <Section title="Траты">
      <p>Кольцевая диаграмма по категориям (месяц).</p>
    </Section>
  )
}

function Accounts() {
  return (
    <Section title="Счета">
      <p>Список счетов и их типы.</p>
    </Section>
  )
}

function Transactions() {
  return (
    <Section title="Операции">
      <p>История операций по датам.</p>
    </Section>
  )
}

function Overview() {
  return (
    <Section title="Обзор">
      <p>Статистика, графики и сводка.</p>
    </Section>
  )
}

function Planned() {
  return (
    <Section title="Запланированные покупки">
      <p>Список целей с ценой и ссылкой.</p>
    </Section>
  )
}

export default function Dashboard() {
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
