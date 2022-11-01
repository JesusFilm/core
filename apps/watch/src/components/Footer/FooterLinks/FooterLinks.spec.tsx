import { render } from '@testing-library/react'
import { FooterLinks } from './FooterLinks'

describe('FooterLinks', () => {
  describe('About', () => {
    it('should have about link', () => {
      const { getByRole } = render(<FooterLinks />)
      expect(getByRole('link', { name: 'About Us' })).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/about/'
      )
    })
    it('should have Contact link', () => {
      const { getByRole } = render(<FooterLinks />)
      expect(getByRole('link', { name: 'Contact' })).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/contact/'
      )
    })
    it('should have Ways to Give link', () => {
      const { getByRole } = render(<FooterLinks />)
      expect(getByRole('link', { name: 'Ways to Give' })).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/give/'
      )
    })
  })
  describe('Sections', () => {
    it('should have Strategies and Tools link', () => {
      const { getByRole } = render(<FooterLinks />)
      expect(
        getByRole('link', { name: 'Strategies and Tools' })
      ).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/partners/mission-trips/'
      )
    })
    it('should have Blog link', () => {
      const { getByRole } = render(<FooterLinks />)
      expect(getByRole('link', { name: 'Blog' })).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/blog/'
      )
    })
    it('should have How to help link', () => {
      const { getByRole } = render(<FooterLinks />)
      expect(getByRole('link', { name: 'How to Help' })).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/partners/'
      )
    })
  })
  describe('Apps', () => {
    it('should have Android link', () => {
      const { getByRole } = render(<FooterLinks />)
      expect(getByRole('link', { name: 'Android' })).toHaveAttribute(
        'href',
        'https://play.google.com/store/apps/details?id=com.jesusfilmmedia.android.jesusfilm'
      )
    })
    it('should have iPhone link', () => {
      const { getByRole } = render(<FooterLinks />)
      expect(getByRole('link', { name: 'iPhone' })).toHaveAttribute(
        'href',
        'https://apps.apple.com/us/app/jesus-film-media/id550525738'
      )
    })
  })
})
