import { render, fireEvent } from '@testing-library/react'
import { Size } from '.'

describe('Button Size selector', () => {
  it('should show button Size properties', () => {
    const { getByRole } = render(<Size id={'button-Size-id'} size={null} />)
    expect(getByRole('button', { name: 'Small' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Large' })).toBeInTheDocument()
  })
  it('should change the Size property', async () => {
    const { getByRole } = render(<Size id={'typography-Size-id'} size={null} />)
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Large' }))
    expect(getByRole('button', { name: 'Large' })).toHaveClass('Mui-selected')
  })
})
