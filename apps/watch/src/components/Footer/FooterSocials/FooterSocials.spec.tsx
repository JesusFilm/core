import { render } from '@testing-library/react'

import { FooterSocials } from './FooterSocials'

describe('FooterSocials', () => {
  it('should have the facebook link', () => {
    const { getByRole } = render(<FooterSocials />)
    const el = getByRole('link', { name: 'Facebook' })
    expect(el).toHaveAttribute('href', 'https://www.facebook.com/jesusfilm')
    expect(el).toHaveAttribute('target', '_blank')
  })

  it('should have the twitter link', () => {
    const { getByRole } = render(<FooterSocials />)
    const el = getByRole('link', { name: 'Twitter' })
    expect(el).toHaveAttribute('href', 'https://twitter.com/jesusfilm')
    expect(el).toHaveAttribute('target', '_blank')
  })

  it('should have the youtube link', () => {
    const { getByRole } = render(<FooterSocials />)
    const el = getByRole('link', { name: 'Youtube' })
    expect(el).toHaveAttribute('href', 'https://www.youtube.com/user/jesusfilm')
    expect(el).toHaveAttribute('target', '_blank')
  })

  it('should have the instagram link', () => {
    const { getByRole } = render(<FooterSocials />)
    const el = getByRole('link', { name: 'Instagram' })
    expect(el).toHaveAttribute('href', 'https://www.instagram.com/jesusfilm')
    expect(el).toHaveAttribute('target', '_blank')
  })
})
