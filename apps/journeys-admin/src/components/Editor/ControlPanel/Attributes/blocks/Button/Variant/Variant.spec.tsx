import { render, fireEvent } from '@testing-library/react'
import { Variant } from '.'

describe('Button variant selector', () => {
  it('should show button variant properties', () => {
    const { getByRole } = render(
      <Variant id={'button-variant-id'} variant={null} />
    )
    expect(getByRole('button', { name: 'Text' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
  })
  it('should change the Variant property', () => {
    const { getByRole } = render(
      <Variant id={'button-variant-id'} variant={null} />
    )
    expect(getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(getByRole('button', { name: 'Text' }))
    expect(getByRole('button', { name: 'Text' })).toHaveClass('Mui-selected')
  })
})
