import { render } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('should have the terms and conditions link', () => {
    const { getByText } = render(<Footer />)
    expect(getByText('Terms').closest('a')).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  it('should have the privacy policy link', () => {
    const { getByText } = render(<Footer />)
    expect(getByText('Privacy').closest('a')).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/privacy.html'
    )
  })
})
