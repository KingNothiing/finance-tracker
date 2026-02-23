import { render, screen, waitFor } from '@testing-library/react'
import Expenses from '../Expenses'
import Accounts from '../Accounts'
import Transactions from '../Transactions'
import Overview from '../Overview'
import Planned from '../Planned'

vi.mock('../../../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('Sections API integration', () => {
  it('loads expenses categories', async () => {
    const api = (await import('../../../api/client')).default
    api.get.mockResolvedValueOnce({ data: [] })
    render(<Expenses />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.getByText(/Нет данных/i)).toBeInTheDocument()
  })

  it('loads accounts', async () => {
    const api = (await import('../../../api/client')).default
    api.get.mockResolvedValueOnce({ data: [] })
    render(<Accounts />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.getByText(/Счетов пока нет/i)).toBeInTheDocument()
  })

  it('loads transactions', async () => {
    const api = (await import('../../../api/client')).default
    api.get.mockResolvedValueOnce({ data: [] })
    render(<Transactions />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.getByText(/Операций пока нет/i)).toBeInTheDocument()
  })

  it('loads overview', async () => {
    const api = (await import('../../../api/client')).default
    api.get.mockResolvedValueOnce({
      data: {
        total_expense: 0,
        total_income: 0,
        avg_daily_expense: 0,
        today_expense: 0,
      },
    })
    render(<Overview />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.getByText(/Расходы/i)).toBeInTheDocument()
  })

  it('loads planned purchases', async () => {
    const api = (await import('../../../api/client')).default
    api.get.mockResolvedValueOnce({ data: [] })
    render(<Planned />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.getByText(/Покупок пока нет/i)).toBeInTheDocument()
  })
})
