import { render, screen } from '@testing-library/react'

import { CountryFlag } from './CountryFlag'

describe('CountryFlag', () => {
  it('renders flag image with correct attributes when code is provided', () => {
    render(<CountryFlag code="US" countryName="United States" />)

    const flagImage = screen.getByRole('img', { name: 'United States flag' })
    expect(flagImage).toBeInTheDocument()
    expect(flagImage).toHaveAttribute('src', 'https://flagcdn.com/w20/us.png')
    expect(flagImage).toHaveAttribute(
      'srcset',
      'https://flagcdn.com/w40/us.png 2x'
    )
    expect(flagImage).toHaveAttribute('alt', 'United States flag')
    expect(flagImage).toHaveAttribute('width', '20')
    expect(flagImage).toHaveAttribute('height', '15')
  })

  it('renders flag image with default alt text when countryName is not provided', () => {
    render(<CountryFlag code="FR" />)

    const flagImage = screen.getByRole('img', { name: 'Country flag' })
    expect(flagImage).toBeInTheDocument()
    expect(flagImage).toHaveAttribute('src', 'https://flagcdn.com/w20/fr.png')
    expect(flagImage).toHaveAttribute('alt', 'Country flag')
  })

  it('renders flag image with custom size', () => {
    render(<CountryFlag code="DE" countryName="Germany" size={40} />)

    const flagImage = screen.getByRole('img', { name: 'Germany flag' })
    expect(flagImage).toHaveAttribute('src', 'https://flagcdn.com/w40/de.png')
    expect(flagImage).toHaveAttribute(
      'srcset',
      'https://flagcdn.com/w80/de.png 2x'
    )
    expect(flagImage).toHaveAttribute('width', '40')
    expect(flagImage).toHaveAttribute('height', '30')
  })

  it('renders null when code is null', () => {
    const { container } = render(<CountryFlag code={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when code is empty string', () => {
    const { container } = render(<CountryFlag code="" />)
    expect(container.firstChild).toBeNull()
  })

  it('converts country code to lowercase in URLs', () => {
    render(<CountryFlag code="GB" countryName="United Kingdom" />)

    const flagImage = screen.getByRole('img', { name: 'United Kingdom flag' })
    expect(flagImage).toHaveAttribute('src', 'https://flagcdn.com/w20/gb.png')
    expect(flagImage).toHaveAttribute(
      'srcset',
      'https://flagcdn.com/w40/gb.png 2x'
    )
  })
})
