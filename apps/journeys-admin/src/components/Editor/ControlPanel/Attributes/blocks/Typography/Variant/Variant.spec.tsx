import { render, fireEvent, waitFor } from '@testing-library/react'
import { Variant } from '.'

describe('TextVariant drawer', () => {
  it('should show default values', () => {
    const { getByRole } = render(
      <Variant id={'font-variant-id'} variant={null} />
    )
    expect(getByRole('button', { name: 'Body 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 2' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 3' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 4' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 5' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 6' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Subtitle 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Subtitle 2' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Overline' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Caption' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Body 2' })).toHaveClass('Mui-selected')
  })
  it('should change the variant property', async () => {
    const { getByRole } = render(
      <Variant id={'font-variant-id'} variant={null} />
    )
    expect(getByRole('button', { name: 'Body 2' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Header 1' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Header 1' })).toHaveClass(
        'Mui-selected'
      )
    )
  })
})
