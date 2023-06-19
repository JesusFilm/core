import { ActionFields_LinkAction as LinkAction } from '../../../../../../__generated__/ActionFields'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'

export type ActionType = 'block' | 'chatButton'

export interface Action {
  url: string
  count: number
  actionType: ActionType
}

export function getActions(journey?: Journey): Action[] {
  const linkActionBlocks = (journey?.blocks ?? []).filter(
    (block) => (block as ButtonBlock).action?.__typename === 'LinkAction'
  )

  const blockActions = linkActionBlocks.map((block) => ({
    url: ((block as ButtonBlock).action as LinkAction).url,
    actionType: 'block' as ActionType
  }))

  const chatButtonActions = (journey?.chatButtons ?? []).map((chatButton) => ({
    url: chatButton.link,
    actionType: 'chatButton' as ActionType
  }))

  const combinedActions = [...chatButtonActions, ...blockActions]

  return combinedActions.reduce<Action[]>((actions, action) => {
    if (action.url !== null) {
      const existingActionIndex = actions.findIndex(
        (count) =>
          count.url === action.url && count.actionType === action.actionType
      )

      if (existingActionIndex !== -1) {
        actions[existingActionIndex].count += 1
      } else {
        actions.push({ ...action, count: 1 })
      }
    }
    return actions
  }, [])
}
