import { render } from '@testing-library/react'
import { FontVariant } from '.'

describe('TextVariant drawer', () => {
  it('should show default values', () => {
    const { getByRole } = render(
      <FontVariant id={'font-variant-id'} variant={null} />
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
})
