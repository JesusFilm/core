import { render } from '@testing-library/react'
import Facebook from '../../../../public/watch/icons/facebook.svg'
import { FooterLink } from './FooterLink'

describe('FooterLink', () => {
  it('should have text link', () => {
    const { getByRole, getByText } = render(
      <FooterLink url="https://www.jesusfilm.org/about/" label="About Us" />
    )
    expect(getByText('About Us')).toBeInTheDocument()
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
    expect(getByRole('img')).toHaveAttribute('src', 'facebook.svg')
    expect(getByRole('img')).toHaveAccessibleName('Facebook')
    expect(getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/jesusfilm'
    )
  })
})
