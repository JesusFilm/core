import { render } from '@testing-library/react'

import { campaignLanguageCookie } from '@core/journeys/ui/Campaign/libs/resolvePageLanguage'
import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { CampaignLanguageRedirect } from './CampaignLanguageRedirect'

const COOKIE = campaignLanguageCookie(campaignPublic.id)
const OTHER_COOKIE = campaignLanguageCookie('otherCampaignId')

describe('CampaignLanguageRedirect', () => {
  const replace = vi.fn()
  const replaceState = vi.fn()
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
    replaceState.mockReset()
    vi.spyOn(window.history, 'replaceState').mockImplementation(replaceState)
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    })
    document.cookie = `${COOKIE}=; max-age=0`
    document.cookie = `${OTHER_COOKIE}=; max-age=0`
    document.cookie = 'campaign-lang=; max-age=0'
    vi.restoreAllMocks()
  })

  it('stays when the browser languages resolve to the page language', () => {
    visit('https://example.org/campaign/outreach-2026')
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).not.toHaveBeenCalled()
  })

  it('goes to the Accept-Language match when it is another campaign language', () => {
    visit('https://example.org/campaign/outreach-2026', ['fr-CA', 'en'])
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).toHaveBeenCalledWith(
      'https://example.org/campaign/outreach-2026?lang=fr'
    )
  })

  it("prefers the campaign's own language cookie to Accept-Language", () => {
    document.cookie = `${COOKIE}=fr`
    visit('https://example.org/campaign/outreach-2026/eur', ['en'])
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).toHaveBeenCalledWith(
      'https://example.org/campaign/outreach-2026/eur?lang=fr'
    )
  })

  it("reads neither another campaign's cookie nor the old site-wide one", () => {
    document.cookie = `${OTHER_COOKIE}=fr`
    document.cookie = 'campaign-lang=fr'
    visit('https://example.org/campaign/outreach-2026', ['en'])
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).not.toHaveBeenCalled()
  })

  it('stays when the URL names a language, leaving the param alone', () => {
    visit('https://example.org/campaign/outreach-2026?lang=en', ['fr'])
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).not.toHaveBeenCalled()
    expect(replaceState).not.toHaveBeenCalled()
  })

  it('stays when the URL carries an empty lang, and strips it keeping the other params and the hash', () => {
    document.cookie = `${COOKIE}=fr`
    visit(
      'https://example.org/campaign/christmas-2026?utm_source=a&lang=&b=2#heroId',
      ['fr']
    )
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).not.toHaveBeenCalled()
    expect(replaceState).toHaveBeenCalledTimes(1)
    expect(replaceState.mock.calls[0][2]).toBe(
      'https://example.org/campaign/christmas-2026?utm_source=a&b=2#heroId'
    )
  })

  it('strips an empty lang on a single-language campaign too', () => {
    visit('https://example.org/campaign/christmas-2026?lang=', ['fr'])
    render(
      <CampaignLanguageRedirect
        campaign={{
          ...campaignPublic,
          languages: [campaignPublic.languages[0]]
        }}
      />
    )
    expect(replace).not.toHaveBeenCalled()
    expect(replaceState.mock.calls[0][2]).toBe(
      'https://example.org/campaign/christmas-2026'
    )
  })

  it('stays on a single-language campaign', () => {
    visit('https://example.org/campaign/outreach-2026', ['fr'])
    render(
      <CampaignLanguageRedirect
        campaign={{
          ...campaignPublic,
          languages: [campaignPublic.languages[0]]
        }}
      />
    )
    expect(replace).not.toHaveBeenCalled()
    expect(replaceState).not.toHaveBeenCalled()
  })
})
