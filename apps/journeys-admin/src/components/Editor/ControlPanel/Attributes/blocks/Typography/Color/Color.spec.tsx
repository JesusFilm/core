import { render, fireEvent, waitFor } from '@testing-library/react'
import { Color } from '.'

describe('Typography color selector', () => {
  it('should show typography color properties', () => {
    const { getByRole } = render(
      <Color id={'typography-color-id'} color={null} />
    )
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
    await waitFor(() =>
      expect(getByRole('button', { name: 'Secondary' })).toHaveClass(
        'Mui-selected'
      )
    )
  })
})
