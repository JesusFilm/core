import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { SignUp } from '@core/journeys/ui/SignUp'

import {
  SignUpBlockUpdateSubmitLabel,
  SignUpBlockUpdateSubmitLabelVariables
} from '../../../../../../../../__generated__/SignUpBlockUpdateSubmitLabel'
import { SignUpFields } from '../../../../../../../../__generated__/SignUpFields'
import { InlineEditInput } from '../InlineEditInput'

export const SIGN_UP_BLOCK_UPDATE_SUBMIT_LABEL = gql`
  mutation SignUpBlockUpdateSubmitLabel($id: ID!, $submitLabel: String!) {
    signUpBlockUpdate(id: $id, input: { submitLabel: $submitLabel }) {
      id
      submitLabel
    }
  }
`
export function SignUpEdit({
  id,
  submitLabel,
  ...signUpProps
}: TreeBlock<SignUpFields>): ReactElement {
  const [signUpBlockUpdate] = useMutation<
    SignUpBlockUpdateSubmitLabel,
    SignUpBlockUpdateSubmitLabelVariables
  >(SIGN_UP_BLOCK_UPDATE_SUBMIT_LABEL)

  const [value, setValue] = useState(submitLabel)
  const [commandInput, setCommandInput] = useState({ id: uuidv4(), value })
  const {
    add,
    state: { undo }
  } = useCommand()
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()

  useEffect(() => {
    if (undo == null || undo.id === commandInput.id) return
    resetCommandInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    if (value !== submitLabel) setValue(submitLabel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitLabel])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  function handleSubmit(value: string): void {
    add({
      id: commandInput.id,
      parameters: {
        execute: {
          submitLabel: value,
          context: {},
          runDispatch: false
        },
        undo: {
          submitLabel: commandInput.value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        },
        redo: {
          submitLabel: value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        }
      },
      execute({ submitLabel, context, runDispatch }) {
        if (runDispatch)
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep
          })
        void signUpBlockUpdate({
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
            debounceKey: `SignUpBlock:${id}`,
            ...context
          }
        })
      }
    })
  }

  return (
    <SignUp
      {...signUpProps}
      id={id}
      submitLabel={submitLabel}
      editableSubmitLabel={
        <InlineEditInput
          name="submitLabel"
          fullWidth
          multiline
          inputRef={(ref) => {
            if (ref != null) ref.focus()
          }}
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
