import { render } from '@testing-library/react'
import { FooterTextLinks } from './FooterTextLinks'

describe('FooterTextLinks', () => {
  describe('About', () => {
    it('should have about link', () => {
      const { getByText } = render(<FooterTextLinks />)
      expect(getByText('About Us').closest('a')).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/about/'
      )
    })
    it('should have Contact link', () => {
      const { getByText } = render(<FooterTextLinks />)
      expect(getByText('Contact').closest('a')).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/contact/'
      )
    })
    it('should have Ways to Give link', () => {
      const { getByText } = render(<FooterTextLinks />)
      expect(getByText('Ways to Give').closest('a')).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/give/'
      )
    })
  })
  describe('Sections', () => {
    it('should have Strategies and Tools link', () => {
      const { getByText } = render(<FooterTextLinks />)
      expect(getByText('Strategies and Tools').closest('a')).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/partners/mission-trips/'
      )
    })
    it('should have Blog link', () => {
      const { getByText } = render(<FooterTextLinks />)
      expect(getByText('Blog').closest('a')).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/blog/'
      )
    })
    it('should have How to help link', () => {
      const { getByText } = render(<FooterTextLinks />)
      expect(getByText('How to Help').closest('a')).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/partners/'
      )
    })
  })
  describe('Apps', () => {
    it('should have Android link', () => {
      const { getByText } = render(<FooterTextLinks />)
      expect(getByText('Android').closest('a')).toHaveAttribute(
        'href',
        'https://play.google.com/store/apps/details?id=com.jesusfilmmedia.android.jesusfilm'
      )
    })
    it('should have iPhone link', () => {
      const { getByText } = render(<FooterTextLinks />)
      expect(getByText('iPhone').closest('a')).toHaveAttribute(
        'href',
        'https://apps.apple.com/us/app/jesus-film-media/id550525738'
      )
    })
  })
})
