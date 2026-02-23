import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from '../Register'

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
})
