import { render } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('should have about link', () => {
    const { getByText } = render(<Footer />)
    expect(getByText('Terms of use').closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/terms/'
    )
  })
  it('should have Contact link', () => {
    const { getByText } = render(<Footer />)
    expect(getByText('Legal Statement').closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/legal/'
    )
  })
})
