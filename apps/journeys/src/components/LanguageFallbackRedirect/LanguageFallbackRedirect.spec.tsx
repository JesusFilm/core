import { render, screen } from '@testing-library/react'

import {
  LanguageFallbackRedirect,
  withLanguageFallback
} from './LanguageFallbackRedirect'

describe('LanguageFallbackRedirect', () => {
  const replace = vi.fn()
  const originalLocation = window.location

  function visit(url: string): void {
    const location = new URL(url)
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: location.href, search: location.search, replace }
    })
  }

  beforeEach(() => {
    replace.mockReset()
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    })
  })

  it('goes to the plain page with the query it arrived with, minus lang', () => {
    visit('https://custom.org/my-journey?lang=en&utm_source=newsletter')
    render(<LanguageFallbackRedirect destination="/my-journey" />)
    expect(replace).toHaveBeenCalledWith('/my-journey?utm_source=newsletter')
  })

  it('goes to the plain page alone when lang was the only param', () => {
    visit('https://custom.org/?lang=xx')
    render(<LanguageFallbackRedirect destination="/" />)
    expect(replace).toHaveBeenCalledWith('/')
  })

  describe('withLanguageFallback', () => {
    function Page({ title }: { title: string }): JSX.Element {
      return <p>{title}</p>
    }
    const Wrapped = withLanguageFallback(Page)

    it('renders the page when static props resolved one', () => {
      visit('https://custom.org/eur?lang=fr')
      render(<Wrapped title="Campaign page" />)
      expect(screen.getByText('Campaign page')).toBeInTheDocument()
      expect(replace).not.toHaveBeenCalled()
    })

    it('redirects when static props resolved a fallback', () => {
      visit('https://custom.org/eur?lang=xx&utm_source=a')
      render(<Wrapped languageFallback="/eur" />)
      expect(replace).toHaveBeenCalledWith('/eur?utm_source=a')
    })
  })
})
