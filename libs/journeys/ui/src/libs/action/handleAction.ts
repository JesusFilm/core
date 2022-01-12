import { NextRouter } from 'next/dist/client/router'
import { nextActiveBlock } from '..'
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
      if (action.journey?.slug != null) {
        void router.push(`/${action.journey.slug}`)
      }
      break
    case 'NavigateAction':
      nextActiveBlock()
      break
  }
}
