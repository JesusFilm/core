import { useCommand } from '@core/journeys/ui/CommandProvider'

import {
  BlockFields,
  BlockFields_ButtonBlock_action,
  BlockFields_FormBlock_action,
  BlockFields_SignUpBlock_action,
  BlockFields_VideoBlock_action
} from '../../../../../../../../../../../__generated__/BlockFields'
import { useBlockActionDeleteMutation } from '../../../../../../../../../../libs/useBlockActionDeleteMutation'
import { useBlockActionEmailUpdateMutation } from '../../../../../../../../../../libs/useBlockActionEmailUpdateMutation'
import { useBlockActionLinkUpdateMutation } from '../../../../../../../../../../libs/useBlockActionLinkUpdateMutation'
import { useBlockActionNavigateToBlockUpdateMutation } from '../../../../../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation'

export type Action =
  | BlockFields_ButtonBlock_action
  | BlockFields_FormBlock_action
  | BlockFields_SignUpBlock_action
  | BlockFields_VideoBlock_action
  | null

interface ActionExecuteParamters {
  blockId: string
  blockTypename: BlockFields['__typename']
  action: Action
  undoAction: Action
}

export function useActionCommand(): {
  addAction: (params: ActionExecuteParamters) => Promise<void>
} {
  const { add } = useCommand()
  const [actionDelete] = useBlockActionDeleteMutation()
  const [blockActionLinkUpdate] = useBlockActionLinkUpdateMutation()
  const [blockActionEmailUpdate] = useBlockActionEmailUpdateMutation()
  const [blockActionNavigateToBlockUpdate] =
    useBlockActionNavigateToBlockUpdateMutation()

  return {
    async addAction({ blockId, blockTypename, action, undoAction }) {
      add({
        parameters: {
          execute: {
            blockId,
            blockTypename,
            action
          },
          undo: {
            blockId,
            blockTypename,
            action: undoAction
          }
        },
        async execute({ blockId, blockTypename, action }) {
          const block = {
            id: blockId,
            __typename: blockTypename
          }
          switch (action?.__typename) {
            case 'LinkAction':
              return await blockActionLinkUpdate(block, action.url)
            case 'EmailAction':
              return await blockActionEmailUpdate(block, action.email)
            case 'NavigateToBlockAction':
              return await blockActionNavigateToBlockUpdate(
                block,
                action.blockId
              )
            default:
              return await actionDelete(block)
          }
        }
      })
    }
  }
}
