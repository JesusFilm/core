import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'

import { CAMPAIGN_LANGUAGE_COOKIE } from '@core/journeys/ui/Campaign'
import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { CampaignLanguageRedirect } from '../CampaignLanguageRedirect'

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
    document.cookie = `${CAMPAIGN_LANGUAGE_COOKIE}=; max-age=0`
    vi.restoreAllMocks()
  })

  it('goes to the plain page with the query it arrived with and an empty lang', () => {
    visit('https://custom.org/my-journey?lang=en&utm_source=newsletter')
    render(<LanguageFallbackRedirect destination="/my-journey" />)
    expect(replace).toHaveBeenCalledWith(
      '/my-journey?utm_source=newsletter&lang='
    )
  })

  it('goes to the plain page with an empty lang when lang was the only param', () => {
    visit('https://custom.org/?lang=xx')
    render(<LanguageFallbackRedirect destination="/" />)
    expect(replace).toHaveBeenCalledWith('/?lang=')
  })

  it('does not bounce back from a stale plain page still listing the removed language', () => {
    document.cookie = `${CAMPAIGN_LANGUAGE_COOKIE}=fr`
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['fr'])
    visit('https://example.org/campaign/christmas-2026?lang=fr&utm_source=a')
    const fallback = render(
      <LanguageFallbackRedirect destination="/campaign/christmas-2026" />
    )
    expect(replace).toHaveBeenCalledWith(
      '/campaign/christmas-2026?utm_source=a&lang='
    )
    fallback.unmount()

    visit(`https://example.org${replace.mock.calls[0][0] as string}`)
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).toHaveBeenCalledTimes(1)
  })

  describe('withLanguageFallback', () => {
    function Page({ title }: { title: string }): ReactElement {
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
      expect(replace).toHaveBeenCalledWith('/eur?utm_source=a&lang=')
    })
  })
})
