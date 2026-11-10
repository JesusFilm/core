import { render } from '@testing-library/react'

import { campaignLanguageCookie } from '@core/journeys/ui/Campaign/libs/resolvePageLanguage'
import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { CampaignLanguageRedirect } from '../CampaignLanguageRedirect'

import { LanguageFallbackRedirect } from './LanguageFallbackRedirect'

const COOKIE = campaignLanguageCookie(campaignPublic.id)

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
    document.cookie = `${COOKIE}=; max-age=0`
    document.cookie = `${campaignLanguageCookie('otherCampaignId')}=; max-age=0`
    vi.restoreAllMocks()
  })

  it('goes to the plain page with the query it arrived with and an empty lang', () => {
    visit('https://custom.org/my-journey?lang=en&utm_source=newsletter')
    render(
      <LanguageFallbackRedirect
        destination="/my-journey"
        campaignId="campaignId"
      />
    )
    expect(replace).toHaveBeenCalledWith(
      '/my-journey?utm_source=newsletter&lang='
    )
  })

  it('goes to the plain page with an empty lang when lang was the only param', () => {
    visit('https://custom.org/?lang=xx')
    render(<LanguageFallbackRedirect destination="/" campaignId="campaignId" />)
    expect(replace).toHaveBeenCalledWith('/?lang=')
  })

  it("clears the campaign's language cookie before it redirects, and no other campaign's", () => {
    document.cookie = `${COOKIE}=fr`
    document.cookie = `${campaignLanguageCookie('otherCampaignId')}=es`
    const cookieSetter = vi.spyOn(document, 'cookie', 'set')
    replace.mockImplementation(() => {
      expect(document.cookie).not.toContain(`${COOKIE}=`)
    })
    visit('https://example.org/campaign/outreach-2026?lang=fr')
    render(
      <LanguageFallbackRedirect
        destination="/campaign/outreach-2026"
        campaignId={campaignPublic.id}
      />
    )
    expect(cookieSetter).toHaveBeenCalledWith(`${COOKIE}=; max-age=0; path=/`)
    expect(cookieSetter).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledTimes(1)
    expect(document.cookie).toContain(
      `${campaignLanguageCookie('otherCampaignId')}=es`
    )
  })

  it('does not bounce back from a stale plain page still listing the removed language', () => {
    document.cookie = `${COOKIE}=fr`
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['fr'])
    visit('https://example.org/campaign/christmas-2026?lang=fr&utm_source=a')
    const fallback = render(
      <LanguageFallbackRedirect
        destination="/campaign/christmas-2026"
        campaignId={campaignPublic.id}
      />
    )
    expect(replace).toHaveBeenCalledWith(
      '/campaign/christmas-2026?utm_source=a&lang='
    )
    fallback.unmount()

    const replaceState = vi
      .spyOn(window.history, 'replaceState')
      .mockImplementation(() => undefined)
    visit(`https://example.org${replace.mock.calls[0][0] as string}`)
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).toHaveBeenCalledTimes(1)
    expect(replaceState.mock.calls[0][2]).toBe(
      'https://example.org/campaign/christmas-2026?utm_source=a'
    )
  })
})
