import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { SignUp } from '@core/journeys/ui/SignUp'
import type { TreeBlock } from '@core/journeys/ui/block'

import {
  SignUpBlockUpdateSubmitLabel,
  SignUpBlockUpdateSubmitLabelVariables
} from '../../../../../../../../__generated__/SignUpBlockUpdateSubmitLabel'
import { SignUpFields } from '../../../../../../../../__generated__/SignUpFields'
import { InlineEditInput } from '../InlineEditInput'

export const SIGN_UP_BLOCK_UPDATE_SUBMIT_LABEL = gql`
  mutation SignUpBlockUpdateSubmitLabel(
    $id: ID!
    $submitLabel: String!
  ) {
    signUpBlockUpdate(id: $id, input: { submitLabel: $submitLabel }) {
      id
      submitLabel
    }
  }
`
export function SignUpEdit({
  id,
  submitLabel,
  __typename,
  ...signUpProps
}: TreeBlock<SignUpFields>): ReactElement {
  const [signUpBlockUpdate] = useMutation<
    SignUpBlockUpdateSubmitLabel,
    SignUpBlockUpdateSubmitLabelVariables
  >(SIGN_UP_BLOCK_UPDATE_SUBMIT_LABEL)

  const [value, setValue] = useState(submitLabel)
  const { add } = useCommand()
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()

  useEffect(() => {
    setValue(submitLabel)
  }, [submitLabel])

  async function handleSubmit(value: string): Promise<void> {
    await add({
      parameters: {
        execute: {
          submitLabel: value
        },
        undo: {
          submitLabel: submitLabel ?? ''
        }
      },
      async execute({ submitLabel }) {
        await signUpBlockUpdate({
          variables: {
            id,
            submitLabel
          },
          optimisticResponse: {
            signUpBlockUpdate: {
              id,
              __typename: 'SignUpBlock',
              submitLabel
            }
          },
          context: {
            debounceKey: `${__typename}:${id}`,
            debounceTimeout: 500
          }
        })
      },
      async undo({ submitLabel }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep
        })
        await signUpBlockUpdate({
          variables: {
            id,
            submitLabel
          },
          optimisticResponse: {
            signUpBlockUpdate: {
              id,
              __typename: 'SignUpBlock',
              submitLabel
            }
          },
          context: {
            debounceKey: `${__typename}:${id}`,
            debounceTimeout: 0
          }
        })
      },
      async redo({ submitLabel }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep
        })
        await signUpBlockUpdate({
          variables: {
            id,
            submitLabel
          },
          optimisticResponse: {
            signUpBlockUpdate: {
              id,
              __typename: 'SignUpBlock',
              submitLabel
            }
          },
          context: {
            debounceKey: `${__typename}:${id}`,
            debounceTimeout: 0
          }
        })
      }
    })
  }

  return (
    <SignUp
      {...signUpProps}
      __typename={__typename}
      id={id}
      submitLabel={submitLabel}
      editableSubmitLabel={
        <InlineEditInput
          name="submitLabel"
          fullWidth
          multiline
          inputRef={(ref) => ref && ref.focus()}
          onFocus={(e) =>
            e.currentTarget.setSelectionRange(
              e.currentTarget.value.length,
              e.currentTarget.value.length
            )
          }
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            handleSubmit(e.target.value)
          }}
          // Stop click and drag outside the iframe deselcting selected block
          onClick={(e) => e.stopPropagation()}
        />
      }
    />
  )
}
