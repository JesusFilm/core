import { render } from '@testing-library/react'
import Facebook from '../../../../public/icons/facebook.svg'
import { FooterLink } from './FooterLink'

describe('FooterLink', () => {
  it('should have text link', () => {
    const { getByRole } = render(
      <FooterLink url="https://www.jesusfilm.org/about/" label="About Us" />
    )
    expect(getByRole('link', { name: 'About Us' })).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/about/'
    )
  })

  it('should have image link', () => {
    const { getByRole } = render(
      <FooterLink
        url="https://www.facebook.com/jesusfilm"
        label="Facebook"
        src={Facebook}
        width="66"
        height="72"
      />
    )
    expect(getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/jesusfilm'
    )
  })
})
