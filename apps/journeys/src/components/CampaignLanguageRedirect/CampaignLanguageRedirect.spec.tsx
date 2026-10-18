import { render } from '@testing-library/react'

import { CAMPAIGN_LANGUAGE_COOKIE } from '@core/journeys/ui/Campaign'
import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { CampaignLanguageRedirect } from './CampaignLanguageRedirect'

describe('CampaignLanguageRedirect', () => {
  const replace = vi.fn()
  const originalLocation = window.location

  function visit(url: string, languages: string[] = ['en-US']): void {
    const location = new URL(url)
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        href: location.href,
        search: location.search,
        replace
      }
    })
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(languages)
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

  it('stays when the browser languages resolve to the page language', () => {
    visit('https://example.org/campaign/christmas-2026')
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).not.toHaveBeenCalled()
  })

  it('goes to the Accept-Language match when it is another campaign language', () => {
    visit('https://example.org/campaign/christmas-2026', ['fr-CA', 'en'])
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).toHaveBeenCalledWith(
      'https://example.org/campaign/christmas-2026?lang=fr'
    )
  })

  it('prefers the language cookie to Accept-Language', () => {
    document.cookie = `${CAMPAIGN_LANGUAGE_COOKIE}=fr`
    visit('https://example.org/campaign/christmas-2026/eur', ['en'])
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).toHaveBeenCalledWith(
      'https://example.org/campaign/christmas-2026/eur?lang=fr'
    )
  })

  it('stays when the URL names a language', () => {
    visit('https://example.org/campaign/christmas-2026?lang=en', ['fr'])
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).not.toHaveBeenCalled()
  })

  it('stays on a single-language campaign', () => {
    visit('https://example.org/campaign/christmas-2026', ['fr'])
    render(
      <CampaignLanguageRedirect
        campaign={{
          ...campaignPublic,
          languages: [campaignPublic.languages[0]]
        }}
      />
    )
    expect(replace).not.toHaveBeenCalled()
  })
})
