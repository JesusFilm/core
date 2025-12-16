import { render } from '@testing-library/react'

import { FooterLink } from './FooterLink'

describe('FooterLink', () => {
  it('should have text link', () => {
    const { getByRole } = render(
      <FooterLink href="/about" label="About Us" />
    )
    const el = getByRole('link', { name: 'About Us' })
    expect(el).toHaveAttribute('href', '/about')
    expect(el).not.toHaveAttribute('target')
    expect(el).toHaveAttribute('rel', 'noopener')
  })

  it('should have image link', () => {
    const { getByRole } = render(
      <FooterLink
        href="https://www.facebook.com/jesusfilm"
        label="Facebook"
        iconSrc="/footer/facebook.svg"
        iconWidth={24}
        iconHeight={24}
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

  it('should apply custom classes to link and text', () => {
    const { getByTestId } = render(
      <FooterLink
        className="text-blue-600"
        href="/"
        label="Jesus Film"
        textClassName="text-lg"
      />
    )
    const link = getByTestId('FooterLink')
    expect(link).toHaveClass('text-blue-600')
    expect(link.querySelector('span')).toHaveClass('text-lg')
  })
})
