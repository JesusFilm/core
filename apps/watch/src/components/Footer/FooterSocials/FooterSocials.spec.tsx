import { render } from '@testing-library/react'
import { FooterSocials } from './FooterSocials'

describe('FooterSocials', () => {
  it('should have the privacy policy link', () => {
    const { getByAltText } = render(<FooterSocials />)
    expect(getByAltText('Facebook').closest('a')).toHaveAttribute(
      'href',
      'https://www.facebook.com/jesusfilm'
    )
  })
  it('should have the privacy policy link', () => {
    const { getByAltText } = render(<FooterSocials />)
    expect(getByAltText('Twitter').closest('a')).toHaveAttribute(
      'href',
      'https://twitter.com/jesusfilm'
    )
  })
  it('should have the privacy policy link', () => {
    const { getByAltText } = render(<FooterSocials />)
    expect(getByAltText('Youtube').closest('a')).toHaveAttribute(
      'href',
      'https://www.youtube.com/user/jesusfilm'
    )
  })
  it('should have the privacy policy link', () => {
    const { getByAltText } = render(<FooterSocials />)
    expect(getByAltText('Instagram').closest('a')).toHaveAttribute(
      'href',
      'https://www.instagram.com/jesusfilm'
    )
  })
})
