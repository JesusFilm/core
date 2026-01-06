import { render } from '@testing-library/react'

import { FooterLink } from './FooterLink'

describe('FooterLink', () => {
  it('should have text link', () => {
    const { getByRole } = render(<FooterLink href="/about/" label="About Us" />)
    const el = getByRole('link', { name: 'About Us' })
    expect(el).toHaveAttribute('href', '/about/')
    expect(el).not.toHaveAttribute('target')
    expect(el).toHaveAttribute('rel', 'noopener')
    expect(el).toHaveClass('cursor-pointer')
  })

  it('should have image link', () => {
    const { getByRole } = render(
      <FooterLink
        href="https://www.facebook.com/jesusfilm"
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
    expect(el).toHaveClass('cursor-pointer')
  })

  it('should apply custom styles when className props are provided', () => {
    const { getByTestId, getByText } = render(
      <FooterLink
        href="/"
        label="Jesus Film logo"
        className="rounded-full"
        labelClassName="text-blue-500"
      />
    )
    expect(getByTestId('FooterLink')).toHaveClass('rounded-full')
    expect(getByText('Jesus Film logo')).toHaveClass('text-blue-500')
  })
})
