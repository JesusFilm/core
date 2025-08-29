import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  SetEditorFocusAction,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import {
  BlockFields,
  BlockFields_ButtonBlock_action,
  BlockFields_SignUpBlock_action,
  BlockFields_VideoBlock_action
} from '../../../../../__generated__/BlockFields'
import { useBlockActionDeleteMutation } from '../../../../libs/useBlockActionDeleteMutation'
import { useBlockActionEmailUpdateMutation } from '../../../../libs/useBlockActionEmailUpdateMutation'
import { useBlockActionLinkUpdateMutation } from '../../../../libs/useBlockActionLinkUpdateMutation'
import { useBlockActionNavigateToBlockUpdateMutation } from '../../../../libs/useBlockActionNavigateToBlockUpdateMutation'
import { useBlockActionPhoneUpdateMutation } from '../../../../libs/useBlockActionPhoneUpdateMutation'

export type Action =
  | BlockFields_ButtonBlock_action
  | BlockFields_SignUpBlock_action
  | BlockFields_VideoBlock_action
  | null

interface AddActionParameters {
  blockId: string
  blockTypename: BlockFields['__typename']
  action: Action
  undoAction: Action | undefined
  editorFocus?: Omit<SetEditorFocusAction, 'type'>
  undoEditorFocus?: Omit<SetEditorFocusAction, 'type'>
}

export function useActionCommand(): {
  addAction: (params: AddActionParameters) => void
} {
  const { add } = useCommand()
  const { dispatch } = useEditor()
  const [actionDelete] = useBlockActionDeleteMutation()
  const [actionLinkUpdate] = useBlockActionLinkUpdateMutation()
  const [actionEmailUpdate] = useBlockActionEmailUpdateMutation()
  const [actionPhoneUpdate] = useBlockActionPhoneUpdateMutation()
  const [actionNavigateToBlockUpdate] =
    useBlockActionNavigateToBlockUpdateMutation()

  return {
    addAction({
      blockId,
      blockTypename,
      action,
      undoAction,
      editorFocus,
      undoEditorFocus
    }: AddActionParameters) {
      add({
        parameters: {
          execute: {
            action,
            editorFocus
          },
          undo: {
            action: undoAction,
            editorFocus: undoEditorFocus ?? editorFocus
          }
        },
        execute({ action, editorFocus }) {
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
              void actionLinkUpdate(block, action.url)
              break
            case 'EmailAction':
              void actionEmailUpdate(block, action.email)
              break
            case 'PhoneAction':
              void actionPhoneUpdate(block, action.phone, action.countryCode)
              break
            case 'NavigateToBlockAction':
              void actionNavigateToBlockUpdate(block, action.blockId)
              break
            default:
              void actionDelete(block)
              break
          }
        }
      })
    }
  }
}
