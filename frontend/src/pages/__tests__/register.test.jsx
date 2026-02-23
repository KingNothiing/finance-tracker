import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Register from '../Register'

vi.mock('../../api/client', () => ({
  default: { post: vi.fn() },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('Register page', () => {
  it('renders form fields', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /зарегистрироваться/i })
    ).toBeInTheDocument()
  })

  it('submits register form', async () => {
    const api = (await import('../../api/client')).default
    api.post.mockResolvedValue({ data: { access: 'a', refresh: 'r' } })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/пароль/i), 'StrongPass123')
    await user.click(screen.getByRole('button', { name: /зарегистрироваться/i }))
    expect(api.post).toHaveBeenCalled()
  })
})
