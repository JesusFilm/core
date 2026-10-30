import { render } from '@testing-library/react'

import { CAMPAIGN_LANGUAGE_COOKIE } from '@core/journeys/ui/Campaign'
import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { CampaignLanguageRedirect } from '../CampaignLanguageRedirect'

import { LanguageFallbackRedirect } from './LanguageFallbackRedirect'

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

  it('does not bounce back from a stale plain page still listing the removed language', () => {
    document.cookie = `${CAMPAIGN_LANGUAGE_COOKIE}=fr`
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

    visit(`https://example.org${replace.mock.calls[0][0] as string}`)
    render(<CampaignLanguageRedirect campaign={campaignPublic} />)
    expect(replace).toHaveBeenCalledTimes(1)
  })
})
