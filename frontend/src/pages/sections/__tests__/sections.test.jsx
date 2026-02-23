import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Categories from '../Categories'
import Accounts from '../Accounts'
import Operations from '../Operations'
import Overview from '../Overview'
import Planned from '../Planned'

vi.mock('../../../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('Sections API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('loads categories stats', async () => {
    const api = (await import('../../../api/client')).default
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
    render(<Categories />)
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

  it('loads operations', async () => {
    const api = (await import('../../../api/client')).default
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
    render(<Operations />)
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

  it('creates account', async () => {
    const api = (await import('../../../api/client')).default
    api.get.mockResolvedValueOnce({ data: [] })
    api.post = vi.fn().mockResolvedValueOnce({
      data: { id: 1, name: 'Cash', type: 'cash', balance: '0.00' },
    })
    const user = userEvent.setup()
    render(<Accounts />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    await user.type(screen.getByLabelText(/Название/i), 'Cash')
    await user.click(screen.getByRole('button', { name: /Добавить счет/i }))
    expect(api.post).toHaveBeenCalled()
  })

  it('creates category', async () => {
    const api = (await import('../../../api/client')).default
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
    api.post = vi.fn().mockResolvedValueOnce({
      data: { id: 1, name: 'Food', icon: '', color: '' },
    })
    const user = userEvent.setup()
    render(<Categories />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    await user.type(screen.getByLabelText(/Название категории/i), 'Food')
    await user.click(screen.getByRole('button', { name: /Добавить категорию/i }))
    expect(api.post).toHaveBeenCalled()
  })

  it('creates planned purchase', async () => {
    const api = (await import('../../../api/client')).default
    api.get.mockResolvedValueOnce({ data: [] })
    api.post = vi.fn().mockResolvedValueOnce({
      data: { id: 1, name: 'Phone', price: '1000.00' },
    })
    const user = userEvent.setup()
    render(<Planned />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    await user.type(screen.getByLabelText(/Название/i), 'Phone')
    await user.type(screen.getByLabelText(/Цена/i), '1000')
    await user.click(screen.getByRole('button', { name: /Добавить покупку/i }))
    expect(api.post).toHaveBeenCalled()
  })

  it('renders operations list', async () => {
    const api = (await import('../../../api/client')).default
    api.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
    render(<Operations />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.getByText(/Операций пока нет/i)).toBeInTheDocument()
  })
})
