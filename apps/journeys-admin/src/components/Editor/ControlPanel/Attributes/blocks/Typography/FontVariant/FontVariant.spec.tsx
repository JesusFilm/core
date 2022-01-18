import { render } from '@testing-library/react'
import { FontVariant } from '.'

describe('TextColor drawer', () => {
  it('should show default values', () => {
    const { getByText, getByRole } = render(
      <FontVariant id={'font-variant-id'} variant={null} />
    )
    expect(getByText('Body 1')).toBeInTheDocument()
    expect(getByText('Header 1')).toBeInTheDocument()
    expect(getByText('Header 2')).toBeInTheDocument()
    expect(getByText('Header 3')).toBeInTheDocument()
    expect(getByText('Header 4')).toBeInTheDocument()
    expect(getByText('Header 5')).toBeInTheDocument()
    expect(getByText('Header 6')).toBeInTheDocument()
    expect(getByText('Subtitle 1')).toBeInTheDocument()
    expect(getByText('Subtitle 2')).toBeInTheDocument()
    expect(getByText('Overline')).toBeInTheDocument()
    expect(getByText('Caption')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Body 2' })).toHaveClass('Mui-selected')
  })
})
