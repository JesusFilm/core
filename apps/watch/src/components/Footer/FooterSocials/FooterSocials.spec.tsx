import { render } from '@testing-library/react'
import { FooterSocials } from './FooterSocials'

describe('FooterSocials', () => {
  it('should have the privacy policy link', () => {
    const { getByRole } = render(<FooterSocials />)
    expect(getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/jesusfilm'
    )
  })
  it('should have the privacy policy link', () => {
    const { getByRole } = render(<FooterSocials />)
    expect(getByRole('link', { name: 'Twitter' })).toHaveAttribute(
      'href',
      'https://twitter.com/jesusfilm'
    )
  })
  it('should have the privacy policy link', () => {
    const { getByRole } = render(<FooterSocials />)
    expect(getByRole('link', { name: 'Youtube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/user/jesusfilm'
    )
  })
  it('should have the privacy policy link', () => {
    const { getByRole } = render(<FooterSocials />)
    expect(getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/jesusfilm'
    )
  })
})
