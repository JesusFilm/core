import { NextRouter } from 'next/dist/client/router'

import { nextActiveBlock } from '../block'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'
import { getJourneyRTL } from '../rtl'

import { ActionFields } from './__generated__/ActionFields'

export function handleAction(
  router: NextRouter,
  action?: ActionFields | null
): void {
  if (action == null) return
  switch (action.__typename) {
    case 'NavigateToBlockAction':
      nextActiveBlock({ id: action.blockId })
      break
    case 'NavigateToJourneyAction':
      if (action.journey != null) {
        const currentRTL = document.dir
        const newRTL = getJourneyRTL(action.journey as Journey).rtl ? 'rtl' : ''

        if (newRTL === currentRTL) {
          void router.push(`/${action.journey.slug}`)
        } else {
          // window.open forces document reload to get correct dir
          window.open(`/${action.journey.slug}`, '_self')
        }
      }
      break
    case 'NavigateAction':
      nextActiveBlock()
      break
    case 'LinkAction':
      if (action.url.startsWith('http')) {
        window.open(action.url, '_blank')
      } else {
        void router.push(action.url)
      }
      break
    case 'EmailAction':
      window.open(`mailto:${action.email}`, '_blank')
      break
  }
}
