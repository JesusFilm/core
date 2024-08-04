import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  SetEditorFocusAction,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import {
  BlockFields,
  BlockFields_ButtonBlock_action,
  BlockFields_FormBlock_action,
  BlockFields_SignUpBlock_action,
  BlockFields_VideoBlock_action
} from '../../../../../__generated__/BlockFields'
import { useBlockActionDeleteMutation } from '../../../../libs/useBlockActionDeleteMutation'
import { useBlockActionEmailUpdateMutation } from '../../../../libs/useBlockActionEmailUpdateMutation'
import { useBlockActionLinkUpdateMutation } from '../../../../libs/useBlockActionLinkUpdateMutation'
import { useBlockActionNavigateToBlockUpdateMutation } from '../../../../libs/useBlockActionNavigateToBlockUpdateMutation'

export type Action =
  | BlockFields_ButtonBlock_action
  | BlockFields_FormBlock_action
  | BlockFields_SignUpBlock_action
  | BlockFields_VideoBlock_action
  | null

interface AddActionParameters {
  blockId: string
  blockTypename: BlockFields['__typename']
  action: Action
  undoAction: Action | undefined
  editorFocus?: Omit<SetEditorFocusAction, 'type'>
}

export function useActionCommand(): {
  addAction: (params: AddActionParameters) => void
} {
  const { add } = useCommand()
  const { dispatch } = useEditor()
  const [actionDelete] = useBlockActionDeleteMutation()
  const [actionLinkUpdate] = useBlockActionLinkUpdateMutation()
  const [actionEmailUpdate] = useBlockActionEmailUpdateMutation()
  const [actionNavigateToBlockUpdate] =
    useBlockActionNavigateToBlockUpdateMutation()

  return {
    addAction({
      blockId,
      blockTypename,
      action,
      undoAction,
      editorFocus
    }: AddActionParameters) {
      await add({
        parameters: {
          execute: {
            action
          },
          undo: {
            action: undoAction
          }
        },
        execute({ action }) {
          const block = {
            id: blockId,
            __typename: blockTypename
          }
          if (editorFocus != null)
            dispatch({
              type: 'SetEditorFocusAction',
              ...editorFocus
            })
          switch (action?.__typename) {
            case 'LinkAction':
              return void actionLinkUpdate(block, action.url)
            case 'EmailAction':
              return void actionEmailUpdate(block, action.email)
            case 'NavigateToBlockAction':
              return void actionNavigateToBlockUpdate(block, action.blockId)
            default:
              return void actionDelete(block)
          }
        }
      })
    }
  }
}
