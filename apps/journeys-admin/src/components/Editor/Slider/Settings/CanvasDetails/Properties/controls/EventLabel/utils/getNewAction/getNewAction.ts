import type { MetaAction } from '../metaActions'
import { metaActions } from '../metaActions'

export function getNewAction(value: string): MetaAction {
  return metaActions.find((action) => action.type === value) ?? metaActions[0]
}
