import { ActionFields } from '../../../__generated__/ActionFields'
import { nextActiveBlock } from '../client/cache/blocks'

export function handleAction(action?: ActionFields | null): void {
  switch (action?.__typename) {
    case 'NavigateToBlockAction':
      nextActiveBlock({ id: action.blockId })
      break
    case 'NavigateAction':
      nextActiveBlock()
      break
  }
}
