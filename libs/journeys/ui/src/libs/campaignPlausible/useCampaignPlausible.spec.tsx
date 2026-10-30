import { fireEvent, render, renderHook } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { ReactElement, ReactNode } from 'react'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import { CampaignProvider } from '../../components/Campaign/CampaignProvider'
import { campaignPublic, eurRegion } from '../../components/Campaign/testData'

import {
  campaignEventProps,
  campaignPlausibleProps,
  journeySlug
} from './campaignPlausibleProps'
import { useCampaignPlausible } from './useCampaignPlausible'

vi.mock('next-plausible', () => ({ usePlausible: vi.fn() }))

const plausible = vi.fn()

const french = { language: { bcp47: 'fr' } }
const untagged = { language: { bcp47: null } }
const afrRegion = { slug: 'afr' }

function wrapper(
  region: typeof eurRegion | null,
  reportEvents?: boolean
): ({ children }: { children: ReactNode }) => ReactElement {
  return function Wrapper({ children }) {
    return (
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind:
            region == null
              ? CampaignPageKind.landing
              : CampaignPageKind.regionTemplate,
          region,
          reportEvents
        }}
      >
        {children}
      </CampaignProvider>
    )
  }
}

describe('useCampaignPlausible', () => {
  beforeEach(() => {
    vi.mocked(usePlausible).mockReturnValue(plausible)
    plausible.mockClear()
  })

  it("sends the event with the page's props on a public Region Page", () => {
    const { result } = renderHook(() => useCampaignPlausible(), {
      wrapper: wrapper(eurRegion, true)
    })
    result.current('campaignQrDownload', { shareLanguage: french })
    expect(plausible).toHaveBeenCalledWith('campaignQrDownload', {
      props: {
        campaign_id: 'campaignId',
        region: 'eur',
        language: 'en',
        shareLanguage: 'fr'
      }
    })
  })

  it('keeps the region the visitor is on apart from the region clicked', () => {
    const { result } = renderHook(() => useCampaignPlausible(), {
      wrapper: wrapper(eurRegion, true)
    })
    result.current('campaignRegionClick', { targetRegion: afrRegion })
    expect(plausible).toHaveBeenCalledWith('campaignRegionClick', {
      props: {
        campaign_id: 'campaignId',
        region: 'eur',
        language: 'en',
        targetRegion: 'afr'
      }
    })
  })

  it('sends no region on the landing page', () => {
    const { result } = renderHook(() => useCampaignPlausible(), {
      wrapper: wrapper(null, true)
    })
    result.current('campaignRegionClick', { targetRegion: afrRegion })
    expect(plausible).toHaveBeenCalledWith('campaignRegionClick', {
      props: { campaign_id: 'campaignId', language: 'en', targetRegion: 'afr' }
    })
  })

  it('sends nothing outside the public page (the editor canvas)', () => {
    const { result } = renderHook(() => useCampaignPlausible(), {
      wrapper: wrapper(eurRegion)
    })
    result.current('campaignQrDownload', { shareLanguage: french })
    expect(plausible).not.toHaveBeenCalled()
  })

  it('sends nothing without a campaign at all', () => {
    const { result } = renderHook(() => useCampaignPlausible())
    result.current('campaignQrDownload', { shareLanguage: french })
    expect(plausible).not.toHaveBeenCalled()
  })
})

describe('useCampaignPlausible on a same-tab link', () => {
  const assign = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(usePlausible).mockReturnValue(plausible)
    plausible.mockClear()
    assign.mockClear()
    vi.stubGlobal('location', { ...window.location, assign })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function Link({ target }: { target?: string }): ReactElement {
    const track = useCampaignPlausible()
    return (
      <a
        href="https://your.nextstep.is/eur"
        target={target}
        onClick={(event) =>
          track('campaignRegionClick', { targetRegion: eurRegion }, event)
        }
      >
        Europe
      </a>
    )
  }

  function renderLink(target?: string, reportEvents = true): void {
    const Wrapper = wrapper(null, reportEvents)
    render(
      <Wrapper>
        <Link target={target} />
      </Wrapper>
    )
  }

  it('holds the navigation until Plausible has the event', () => {
    renderLink()
    const notPrevented = fireEvent.click(document.querySelector('a') as Element)
    expect(notPrevented).toBe(false)
    expect(assign).not.toHaveBeenCalled()
    const { callback } = plausible.mock.calls[0][1]
    callback()
    expect(assign).toHaveBeenCalledWith('https://your.nextstep.is/eur')
    vi.advanceTimersByTime(1000)
    expect(assign).toHaveBeenCalledTimes(1)
  })

  it('navigates after a second when Plausible never answers', () => {
    renderLink()
    fireEvent.click(document.querySelector('a') as Element)
    vi.advanceTimersByTime(999)
    expect(assign).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(assign).toHaveBeenCalledWith('https://your.nextstep.is/eur')
  })

  it('leaves a new-tab or modified click to the browser', () => {
    renderLink('_blank')
    expect(fireEvent.click(document.querySelector('a') as Element)).toBe(true)
    fireEvent.click(document.querySelector('a') as Element, { metaKey: true })
    expect(plausible).toHaveBeenCalledTimes(2)
    expect(plausible.mock.calls[0][1].callback).toBeUndefined()
    vi.advanceTimersByTime(1000)
    expect(assign).not.toHaveBeenCalled()
  })

  it('leaves the click alone outside the public page', () => {
    renderLink(undefined, false)
    expect(fireEvent.click(document.querySelector('a') as Element)).toBe(true)
    expect(plausible).not.toHaveBeenCalled()
  })
})

describe('campaignPlausibleProps', () => {
  it('leaves out a Page Language without a BCP 47 tag', () => {
    expect(
      campaignPlausibleProps(
        {
          ...campaignPublic,
          language: { ...campaignPublic.language, bcp47: null }
        },
        null
      )
    ).toEqual({ campaign_id: 'campaignId' })
  })
})

describe('campaignEventProps', () => {
  it("names the journey by its address's last path segment", () => {
    expect(
      campaignEventProps('campaignJourneyClick', {
        source: 'share',
        journeyUrl: 'https://team.example.org/easter-story/',
        shareLanguage: french
      })
    ).toEqual({ journey: 'easter-story', source: 'share', shareLanguage: 'fr' })
  })

  it('leaves the journey out without a journey address', () => {
    expect(
      campaignEventProps('campaignJourneyClick', {
        source: 'card',
        journeyUrl: null
      })
    ).toEqual({ source: 'card' })
  })

  it("sends the Share Language's tag when the Share Link is copied", () => {
    expect(
      campaignEventProps('campaignShareLinkCopy', { shareLanguage: french })
    ).toEqual({ shareLanguage: 'fr' })
  })

  it('leaves out a Share Language without a BCP 47 tag', () => {
    expect(
      campaignEventProps('campaignShareLinkCopy', { shareLanguage: untagged })
    ).toEqual({})
    expect(
      campaignEventProps('campaignJourneyClick', {
        source: 'share',
        journeyUrl: 'https://your.nextstep.is/easter-story',
        shareLanguage: untagged
      })
    ).toEqual({ journey: 'easter-story', source: 'share' })
  })
})

describe('journeySlug', () => {
  it("is the last path segment of a journey's address", () => {
    expect(journeySlug('https://your.nextstep.is/easter-story')).toBe(
      'easter-story'
    )
  })

  it('is nothing for an address with no path or that does not parse', () => {
    expect(journeySlug('https://your.nextstep.is/')).toBeUndefined()
    expect(journeySlug('not a url')).toBeUndefined()
    expect(journeySlug(undefined)).toBeUndefined()
  })
})
