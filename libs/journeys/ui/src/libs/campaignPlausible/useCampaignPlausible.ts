import { usePlausible } from 'next-plausible'
import { MouseEvent, useCallback } from 'react'

import { useOptionalCampaign } from '../../components/Campaign/CampaignProvider'

import {
  CampaignEventInputs,
  campaignEventProps,
  campaignPlausibleProps
} from './campaignPlausibleProps'
import type { CampaignPlausibleEventName } from './campaignPlausibleSite'

export type CampaignPlausibleTrack = <Event extends CampaignPlausibleEventName>(
  eventName: Event,
  input: CampaignEventInputs[Event],
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
 * Send a campaign event to the page's Plausible sites: the page's own props
 * (`campaignPlausibleProps`) plus the event's, built from the domain objects
 * the call site hands over (`campaignEventProps`). Only a public Campaign
 * Public Page reports (`reportEvents` on the CampaignProvider); the editor
 * canvas, which renders the same components, never does.
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
    (eventName, input, click) => {
      if (context?.reportEvents !== true) return
      const props = {
        ...campaignPlausibleProps(context.campaign, context.region),
        ...campaignEventProps(eventName, input)
      }
      const href = click == null ? null : sameTabHref(click)
      if (click == null || href == null) {
        plausible(eventName, { props })
        return
      }
      click.preventDefault()
      let followed = false
      function follow(): void {
        if (followed || href == null) return
        followed = true
        window.location.assign(href)
      }
      plausible(eventName, { props, callback: follow })
      setTimeout(follow, FOLLOW_TIMEOUT_MS)
    },
    [context, plausible]
  )
}
