import { render, fireEvent } from '@testing-library/react'
import { Size } from '.'

describe('Button size selector', () => {
  it('should show button size properties', () => {
    const { getByRole } = render(<Size id={'button-size-id'} size={null} />)
    expect(getByRole('button', { name: 'Small' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Large' })).toBeInTheDocument()
  })
  it('should change the size property', () => {
    const { getByRole } = render(<Size id={'typography-size-id'} size={null} />)
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Large' }))
    expect(getByRole('button', { name: 'Large' })).toHaveClass('Mui-selected')
  })
})
