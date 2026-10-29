import { usePlausible } from 'next-plausible'
import { MouseEvent, useCallback } from 'react'

import { useOptionalCampaign } from '../../components/Campaign/CampaignProvider'
import type {
  CampaignPublic,
  CampaignRegion
} from '../../components/Campaign/types'

import type {
  CampaignPlausibleEvents,
  CampaignPlausibleProps
} from './campaignPlausibleSite'

/**
 * The props every view and event of a campaign page carries: the campaign, the
 * Region Page's slug (none on the landing page) and the Page Language's BCP 47
 * tag. Readable values, since Plausible's own dashboard shows them as sent.
 */
export function campaignPlausibleProps(
  campaign: Pick<CampaignPublic, 'id' | 'language'>,
  region: Pick<CampaignRegion, 'slug'> | null
): CampaignPlausibleProps {
  return {
    campaign_id: campaign.id,
    ...(region != null ? { region: region.slug } : {}),
    ...(campaign.language.bcp47 != null
      ? { language: campaign.language.bcp47 }
      : {})
  }
}

/** A journey's slug for `campaignJourneyClick`: the last path segment of its public address. */
export function journeySlug(journeyUrl: string): string {
  try {
    const segments = new URL(journeyUrl).pathname.split('/').filter(Boolean)
    return segments[segments.length - 1] ?? journeyUrl
  } catch {
    return journeyUrl
  }
}

export type CampaignPlausibleTrack = <
  EventName extends keyof CampaignPlausibleEvents
>(
  eventName: EventName,
  props: CampaignPlausibleEvents[EventName],
  /** The click on a link that leaves the page, so the event outlives it. */
  click?: MouseEvent<HTMLElement>
) => void

// The longest a same-tab link waits for Plausible before it navigates anyway.
const FOLLOW_TIMEOUT_MS = 1000

/** The address a plain left click on a same-tab link would open; null for anything the browser should keep. */
function sameTabHref(click: MouseEvent<HTMLElement>): string | null {
  const anchor = click.currentTarget.closest('a')
  if (anchor == null || anchor.href === '') return null
  if (anchor.target !== '' && anchor.target !== '_self') return null
  if (click.defaultPrevented || click.button !== 0) return null
  if (click.metaKey || click.ctrlKey || click.shiftKey || click.altKey)
    return null
  return anchor.href
}

/**
 * Send a campaign event to the page's Plausible sites with the page's own props
 * (`campaignPlausibleProps`); the event's props win, so `campaignRegionClick`
 * names its target region. Only a public Campaign Public Page reports
 * (`reportEvents` on the CampaignProvider); the editor canvas, which renders
 * the same components, never does.
 *
 * Given the click on a same-tab link, the navigation waits until Plausible has
 * the event (at most `FOLLOW_TIMEOUT_MS`), as Plausible's own outbound-link
 * tracking does: the tracker's request would otherwise die with the page. A
 * new-tab or modified click is left to the browser.
 */
export function useCampaignPlausible(): CampaignPlausibleTrack {
  const context = useOptionalCampaign()
  const plausible = usePlausible()
  return useCallback<CampaignPlausibleTrack>(
    (eventName, props, click) => {
      if (context?.reportEvents !== true) return
      const eventProps = {
        ...campaignPlausibleProps(context.campaign, context.region),
        ...props
      }
      const href = click == null ? null : sameTabHref(click)
      if (click == null || href == null) {
        plausible(eventName, { props: eventProps })
        return
      }
      click.preventDefault()
      let followed = false
      function follow(): void {
        if (followed || href == null) return
        followed = true
        window.location.assign(href)
      }
      plausible(eventName, { props: eventProps, callback: follow })
      setTimeout(follow, FOLLOW_TIMEOUT_MS)
    },
    [context, plausible]
  )
}
