import { render } from '@testing-library/react'

import { FooterLinks } from './FooterLinks'

describe('FooterLinks', () => {
  describe('About', () => {
    it('should have About Jesus Film Project link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'About Jesus Film Project' })
      expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/about/')
      expect(el).not.toHaveAttribute('target')
    })

    it('should have Contact link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'Contact' })
      expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/contact/')
      expect(el).not.toHaveAttribute('target')
    })

    it('should have Ways to Give link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'Ways to Give' })
      expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/give/')
      expect(el).not.toHaveAttribute('target')
    })
  })

  describe('Sections', () => {
    it('should have Watch link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'Watch' })
      expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/watch/')
      expect(el).not.toHaveAttribute('target')
    })

    it('should have Strategies and Tools link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'Strategies and Tools' })
      expect(el).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/partners/resources/'
      )
      expect(el).not.toHaveAttribute('target')
    })

    it('should have Blog link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'Blog' })
      expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/blog/')
      expect(el).not.toHaveAttribute('target')
    })

    it('should have How to Help link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'How to Help' })
      expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/partners/')
      expect(el).not.toHaveAttribute('target')
    })
  })

  describe('Apps', () => {
    it('should have Android link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'Android' })
      expect(el).toHaveAttribute(
        'href',
        'https://play.google.com/store/apps/details?id=com.jesusfilmmedia.android.jesusfilm'
      )
      expect(el).toHaveAttribute('target', '_blank')
    })

    it('should have iPhone link', () => {
      const { getByRole } = render(<FooterLinks />)
      const el = getByRole('link', { name: 'iPhone' })
      expect(el).toHaveAttribute(
        'href',
        'https://apps.apple.com/us/app/jesus-film-media/id550525738'
      )
      expect(el).toHaveAttribute('target', '_blank')
    })
  })
})
