import { fireEvent, render, renderHook } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { ReactElement, ReactNode } from 'react'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import { CampaignProvider } from '../../components/Campaign/CampaignProvider'
import { campaignPublic, eurRegion } from '../../components/Campaign/testData'

import {
  campaignPlausibleProps,
  journeySlug,
  useCampaignPlausible
} from './useCampaignPlausible'

vi.mock('next-plausible', () => ({ usePlausible: vi.fn() }))

const plausible = vi.fn()

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
    result.current('campaignQrDownload', { shareLanguage: 'fr' })
    expect(plausible).toHaveBeenCalledWith('campaignQrDownload', {
      props: {
        campaign_id: 'campaignId',
        region: 'eur',
        language: 'en',
        shareLanguage: 'fr'
      }
    })
  })

  it('sends no region on the landing page', () => {
    const { result } = renderHook(() => useCampaignPlausible(), {
      wrapper: wrapper(null, true)
    })
    result.current('campaignRegionClick', { region: 'afr' })
    expect(plausible).toHaveBeenCalledWith('campaignRegionClick', {
      props: { campaign_id: 'campaignId', language: 'en', region: 'afr' }
    })
  })

  it('sends nothing outside the public page (the editor canvas)', () => {
    const { result } = renderHook(() => useCampaignPlausible(), {
      wrapper: wrapper(eurRegion)
    })
    result.current('campaignQrDownload', { shareLanguage: 'fr' })
    expect(plausible).not.toHaveBeenCalled()
  })

  it('sends nothing without a campaign at all', () => {
    const { result } = renderHook(() => useCampaignPlausible())
    result.current('campaignQrDownload', { shareLanguage: 'fr' })
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
          track('campaignRegionClick', { region: 'eur' }, event)
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
  it('leaves out a language without a BCP 47 tag', () => {
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

describe('journeySlug', () => {
  it("is the last path segment of a journey's address", () => {
    expect(journeySlug('https://your.nextstep.is/easter-story')).toBe(
      'easter-story'
    )
    expect(journeySlug('https://team.example.org/easter-story/')).toBe(
      'easter-story'
    )
  })

  it('falls back to the address itself when it does not parse', () => {
    expect(journeySlug('not a url')).toBe('not a url')
  })
})
