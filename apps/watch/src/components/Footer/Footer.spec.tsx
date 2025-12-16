import { render, screen } from '@testing-library/react'

import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the Jesus Film logo', () => {
    render(<Footer />)
    const logos = screen.getAllByAltText('Jesus Film logo')
    expect(logos.length).toBeGreaterThan(0)
    expect(logos[0].closest('a')).toHaveAttribute('href', '/')
  })

  it('renders navigation links', () => {
    render(<Footer />)

    const navigationLinks = [
      { name: 'Share', href: '/partners/share' },
      { name: 'Watch', href: '/watch' },
      { name: 'Giving', href: '/give' },
      { name: 'About', href: '/about' },
      { name: 'Products', href: '/products' },
      { name: 'Resources', href: '/partners/resources' },
      { name: 'Partners', href: '/partners' },
      { name: 'Contact', href: '/contact' }
    ]

    navigationLinks.forEach((link) => {
      expect(screen.getByText(link.name).closest('a')).toHaveAttribute(
        'href',
        link.href
      )
    })
  })

  it('renders the Give Now button', () => {
    render(<Footer />)

    const giveNowButtons = screen.getAllByText('Give Now')
    expect(giveNowButtons.length).toBeGreaterThan(0)
    expect(giveNowButtons[0].closest('a')).toHaveAttribute(
      'href',
      '/how-to-help/ways-to-donate/give-now/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=/dev/special/thank-you-refer/social-share/'
    )
  })

  it('renders contact and legal information', () => {
    render(<Footer />)

    expect(screen.getByText('100 Lake Hart Drive')).toBeInTheDocument()
    expect(screen.getByText('Orlando, FL, 32832')).toBeInTheDocument()
    expect(screen.getByText('Resources (1ff1d50)')).toBeInTheDocument()
    expect(screen.getByText('Office: (407) 826-2300')).toBeInTheDocument()
    expect(screen.getByText('Fax: (407) 826-2375')).toBeInTheDocument()

    const privacyPolicyLinks = screen.getAllByText('Privacy Policy')
    expect(privacyPolicyLinks.length).toBeGreaterThan(0)
    expect(privacyPolicyLinks[0].closest('a')).toHaveAttribute(
      'href',
      '/privacy'
    )

    const legalStatementLinks = screen.getAllByText('Legal Statement')
    expect(legalStatementLinks.length).toBeGreaterThan(0)
    expect(legalStatementLinks[0].closest('a')).toHaveAttribute(
      'href',
      '/legal'
    )
  })

  it('omits social media and newsletter links', () => {
    render(<Footer />)

    expect(screen.queryByAltText('Facebook')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Instagram')).not.toBeInTheDocument()
    expect(screen.queryByAltText('YouTube')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign Up For Our Newsletter')).not.toBeInTheDocument()
  })
})
