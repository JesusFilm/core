import { NextRouter } from 'next/dist/client/router'

import { nextActiveBlock } from '../block'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'
import { getJourneyRTL } from '../rtl'

import { ActionFields } from './__generated__/ActionFields'

export function handleAction(
  router: NextRouter,
  action?: ActionFields | null
): void {
  const journeysUrls = [
    'your.nextstep.is',
    'localhost:4100',
    'your-stage.nextstep.is'
  ]

  if (action == null) return
  switch (action.__typename) {
    case 'NavigateToBlockAction':
      nextActiveBlock({ id: action.blockId })
      break
    case 'NavigateAction':
      nextActiveBlock()
      break
    case 'LinkAction':
      if (
        action.url.startsWith('http') &&
        !journeysUrls.some((substring) => action.url.includes(substring))
      ) {
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
