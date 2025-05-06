import { render } from '@testing-library/react'

import { FooterLink } from './FooterLink'

describe('FooterLink', () => {
  it('should have text link', () => {
    const { getByRole } = render(<FooterLink url="/about/" label="About Us" />)
    const el = getByRole('link', { name: 'About Us' })
    expect(el).toHaveAttribute('href', '/about/')
    expect(el).not.toHaveAttribute('target')
    expect(el).toHaveAttribute('rel', 'noopener')
  })

  it('should have image link', () => {
    const { getByRole } = render(
      <FooterLink
        url="https://www.facebook.com/jesusfilm"
        label="Facebook"
        src="/footer/facebook.svg"
        width={24}
        height={24}
        target="_blank"
        noFollow
      />
    )
    expect(getByRole('img')).toHaveAttribute('alt', 'Facebook')
    const el = getByRole('link', { name: 'Facebook' })
    expect(el).toHaveAttribute('href', 'https://www.facebook.com/jesusfilm')
    expect(el).toHaveAttribute('target', '_blank')
    expect(el).toHaveAttribute('rel', 'nofollow noopener')
  })

  it('should apply custom styles when sx prop is provided', () => {
    const { getByTestId } = render(
      <FooterLink
        url="/"
        label="Jesus Film logo"
        src="/footer/jesus-film-logo.svg"
        sx={{ lineHeight: 0 }}
      />
    )
    const link = getByTestId('FooterLink')
    expect(link).toHaveStyle('line-height: 0')
  })
})
