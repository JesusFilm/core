import { render } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('should have Terms of use link', () => {
    const { getAllByText } = render(<Footer />)
    expect(getAllByText('Terms of use')).toHaveLength(2)
    const termsLink = getAllByText('Terms of use')[0]
    expect(termsLink.closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/terms/'
    )
  })
  it('should have Legal Statement link', () => {
    const { getAllByText } = render(<Footer />)
    expect(getAllByText('Legal Statement')).toHaveLength(2)
    const legalLink = getAllByText('Legal Statement')[0]
    expect(legalLink.closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/legal/'
    )
  })
})
