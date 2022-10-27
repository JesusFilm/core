import { render } from '@testing-library/react'
import { FooterLogos } from './FooterLogos'

describe('FooterLogos', () => {
  describe('Logos', () => {
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
  describe('Socials', () => {
    it('should have the privacy policy link', () => {
      const { getByAltText } = render(<FooterLogos />)
      expect(getByAltText('Facebook').closest('a')).toHaveAttribute(
        'href',
        'https://www.facebook.com/jesusfilm'
      )
    })
    it('should have the privacy policy link', () => {
      const { getByAltText } = render(<FooterLogos />)
      expect(getByAltText('Twitter').closest('a')).toHaveAttribute(
        'href',
        'https://twitter.com/jesusfilm'
      )
    })
    it('should have the privacy policy link', () => {
      const { getByAltText } = render(<FooterLogos />)
      expect(getByAltText('Youtube').closest('a')).toHaveAttribute(
        'href',
        'https://www.youtube.com/user/jesusfilm'
      )
    })
    it('should have the privacy policy link', () => {
      const { getByAltText } = render(<FooterLogos />)
      expect(getByAltText('Instagram').closest('a')).toHaveAttribute(
        'href',
        'https://www.instagram.com/jesusfilm'
      )
    })
  })
})
