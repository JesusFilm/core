import { render, screen } from '@testing-library/react'

import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the Jesus Film logo', () => {
    render(<Footer />)
    const logos = screen.getAllByAltText('Jesus Film logo')
    expect(logos.length).toBeGreaterThan(0)
    expect(logos[0].closest('a')).toHaveAttribute('href', '/')
  })

  it('renders social media links', () => {
    render(<Footer />)

    // Check for images instead of labels
    const twitterIcons = screen.getAllByAltText('X (Twitter)')
    expect(twitterIcons.length).toBeGreaterThan(0)
    expect(twitterIcons[0].closest('a')).toHaveAttribute(
      'href',
      'https://twitter.com/jesusfilm'
    )
    expect(twitterIcons[0].closest('a')).toHaveAttribute('target', '_blank')

    const facebookIcons = screen.getAllByAltText('Facebook')
    expect(facebookIcons.length).toBeGreaterThan(0)
    expect(facebookIcons[0].closest('a')).toHaveAttribute(
      'href',
      'https://www.facebook.com/jesusfilm'
    )
    expect(facebookIcons[0].closest('a')).toHaveAttribute('target', '_blank')

    const instagramIcons = screen.getAllByAltText('Instagram')
    expect(instagramIcons.length).toBeGreaterThan(0)
    expect(instagramIcons[0].closest('a')).toHaveAttribute(
      'href',
      'https://www.instagram.com/jesusfilm'
    )
    expect(instagramIcons[0].closest('a')).toHaveAttribute('target', '_blank')

    const youtubeIcons = screen.getAllByAltText('YouTube')
    expect(youtubeIcons.length).toBeGreaterThan(0)
    expect(youtubeIcons[0].closest('a')).toHaveAttribute(
      'href',
      'https://www.youtube.com/user/jesusfilm'
    )
    expect(youtubeIcons[0].closest('a')).toHaveAttribute('target', '_blank')
  })

  it('renders navigation links', () => {
    render(<Footer />)

    const navigationLinks = [
      { name: 'Share', href: '/partners/share/' },
      { name: 'Watch', href: '/watch/' },
      { name: 'Giving', href: '/give/' },
      { name: 'About', href: '/about/' },
      { name: 'Products', href: '/products/' },
      { name: 'Resources', href: '/partners/resources/' },
      { name: 'Partners', href: '/partners/' },
      { name: 'Contact', href: '/contact/' }
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

  it('renders contact information', () => {
    render(<Footer />)

    const addressLines = screen.getAllByText('100 Lake Hart Drive')
    expect(addressLines.length).toBeGreaterThan(0)

    const cityLines = screen.getAllByText('Orlando, FL, 32832')
    expect(cityLines.length).toBeGreaterThan(0)

    const officeLines = screen.getAllByText('Office: (407) 826-2300')
    expect(officeLines.length).toBeGreaterThan(0)

    const faxLines = screen.getAllByText('Fax: (407) 826-2375')
    expect(faxLines.length).toBeGreaterThan(0)
  })

  it('renders legal links', () => {
    render(<Footer />)

    const privacyPolicyLinks = screen.getAllByText('Privacy Policy')
    expect(privacyPolicyLinks.length).toBeGreaterThan(0)
    expect(privacyPolicyLinks[0].closest('a')).toHaveAttribute(
      'href',
      '/privacy/'
    )

    const legalStatementLinks = screen.getAllByText('Legal Statement')
    expect(legalStatementLinks.length).toBeGreaterThan(0)
    expect(legalStatementLinks[0].closest('a')).toHaveAttribute(
      'href',
      '/legal/'
    )
  })

  it('renders newsletter section', () => {
    render(<Footer />)

    const newsletterButtons = screen.getAllByText('Sign Up For Our Newsletter')
    expect(newsletterButtons.length).toBeGreaterThan(0)
    expect(newsletterButtons[0].closest('a')).toHaveAttribute('href', '/email/')
  })
})
