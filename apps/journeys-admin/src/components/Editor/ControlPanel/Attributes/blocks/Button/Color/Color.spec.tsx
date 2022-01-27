import { render, fireEvent } from '@testing-library/react'
import { Color } from '.'

describe('Button color selector', () => {
  it('should show button color properties', () => {
    const { getByRole } = render(<Color id={'button-color-id'} color={null} />)
    expect(getByRole('button', { name: 'Default' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })
  it('should change the color property', async () => {
    const { getByRole } = render(
      <Color id={'typography-color-id'} color={null} />
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    expect(getByRole('button', { name: 'Secondary' })).toHaveClass(
      'Mui-selected'
    )
  })
})
