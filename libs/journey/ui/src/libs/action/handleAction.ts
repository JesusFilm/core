import { NextRouter } from 'next/dist/client/router'
import { ActionFields } from './__generated__/ActionFields'
import { nextActiveBlock } from '../useBlocks/blocks'

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
