import { render } from '@testing-library/react'
import { FooterLogos } from './FooterLogos'

describe('FooterLogos', () => {
  it('should have the terms and conditions link', () => {
    const { getByAltText } = render(<FooterLogos />)
    expect(getByAltText('Jesus Film logo').closest('a')).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org'
    )
  })
  it('should have the privacy policy link', () => {
    const { getByAltText } = render(<FooterLogos />)
    expect(getByAltText('Cru logo').closest('a')).toHaveAttribute(
      'href',
      'https://www.cru.org/'
    )
  })
})
