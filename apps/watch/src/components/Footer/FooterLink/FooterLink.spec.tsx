import { render } from '@testing-library/react'

import Facebook from '../FooterSocials/assets/facebook.svg'

import { FooterLink } from './FooterLink'

describe('FooterLink', () => {
  it('should have text link', () => {
    const { getByRole } = render(
      <FooterLink url="https://www.jesusfilm.org/about/" label="About Us" />
    )
    const el = getByRole('link', { name: 'About Us' })
    expect(el).toHaveAttribute('href', 'https://www.jesusfilm.org/about/')
    expect(el).not.toHaveAttribute('target')
  })

  it('should have image link', () => {
    const { getByRole } = render(
      <FooterLink
        url="https://www.facebook.com/jesusfilm"
        label="Facebook"
        src={Facebook}
        width="66"
        height="72"
        target="_blank"
      />
    )
    expect(getByRole('img')).toHaveAttribute('src', 'facebook.svg')
    expect(getByRole('img')).toHaveAccessibleName('Facebook')
    const el = getByRole('link', { name: 'Facebook' })
    expect(el).toHaveAttribute('href', 'https://www.facebook.com/jesusfilm')
    expect(el).toHaveAttribute('target', '_blank')
  })
})
