import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'

describe('Dashboard', () => {
  it('renders navigation tabs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Dashboard />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /Траты/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Счета/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Операции/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Обзор/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Покупки/i })).toBeInTheDocument()
  })
})
