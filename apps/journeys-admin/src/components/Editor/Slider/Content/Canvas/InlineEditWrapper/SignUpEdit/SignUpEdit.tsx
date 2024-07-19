import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { SignUp } from '@core/journeys/ui/SignUp'
import type { TreeBlock } from '@core/journeys/ui/block'

import {
  SignUpBlockUpdateContent,
  SignUpBlockUpdateContentVariables
} from '../../../../../../../../__generated__/SignUpBlockUpdateContent'
import { SignUpFields } from '../../../../../../../../__generated__/SignUpFields'
import { InlineEditInput } from '../InlineEditInput'
import { useOnClickOutside } from '../useOnClickOutside/useOnClickOutside'

export const SIGN_UP_BLOCK_UPDATE_CONTENT = gql`
  mutation SignUpBlockUpdateContent(
    $id: ID!
    $input: SignUpBlockUpdateInput!
  ) {
    signUpBlockUpdate(id: $id, input: $input) {
      id
      submitLabel
    }
  }
`
interface SignUpEditProps extends TreeBlock<SignUpFields> {}

export function SignUpEdit({
  id,
  submitLabel,
  ...signUpProps
}: SignUpEditProps): ReactElement {
  const [signUpBlockUpdate] = useMutation<
    SignUpBlockUpdateContent,
    SignUpBlockUpdateContentVariables
  >(SIGN_UP_BLOCK_UPDATE_CONTENT)

  const { add } = useCommand()
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const [value, setValue] = useState(submitLabel ?? '')

  async function handleSaveBlock(): Promise<void> {
    const currentSubmitLabel = value.trim().replace(/\n/g, '')
    if (submitLabel === currentSubmitLabel) return

    await add({
      parameters: {
        execute: {
          submitLabel: currentSubmitLabel
        },
        undo: {
          submitLabel
        }
      },
      async execute({ submitLabel }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep
        })

        await signUpBlockUpdate({
          variables: {
            id,
            input: { submitLabel }
          },
          optimisticResponse: {
            signUpBlockUpdate: {
              id,
              __typename: 'SignUpBlock',
              submitLabel
            }
          }
        })
      }
    })
  }
  const inputRef = useOnClickOutside(async () => await handleSaveBlock())

  const input = (
    <InlineEditInput
      name={`edit-${id}`}
      ref={inputRef}
      fullWidth
      multiline
      autoFocus
      onBlur={handleSaveBlock}
      value={value}
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <SignUp
      {...signUpProps}
      id={id}
      submitLabel={submitLabel}
      editableSubmitLabel={input}
      sx={{
        '&:hover': {
          backgroundColor: 'primary.main'
        }
      }}
    />
  )
}
