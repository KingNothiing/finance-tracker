import { render, screen } from '@testing-library/react'
import PieChart from '../PieChart'

describe('PieChart', () => {
  it('renders slices', () => {
    render(
      <PieChart
        data={[
          { id: 1, value: 30, color: '#f00' },
          { id: 2, value: 70, color: '#0f0' },
        ]}
      />
    )
    const slices = screen.getAllByTestId('pie-slice')
    expect(slices.length).toBe(2)
  })
})
