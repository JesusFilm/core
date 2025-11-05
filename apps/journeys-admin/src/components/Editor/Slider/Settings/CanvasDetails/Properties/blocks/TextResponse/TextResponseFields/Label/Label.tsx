import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseLabelUpdate,
  TextResponseLabelUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseLabelUpdate'

/**
 * GraphQL mutation for updating the label text in a TextResponse block.
 */
export const TEXT_RESPONSE_LABEL_UPDATE = gql`
  mutation TextResponseLabelUpdate($id: ID!, $label: String!) {
    textResponseBlockUpdate(id: $id, input: { label: $label }) {
      id
      label
    }
  }
`

/**
 * A component that renders a text field for editing the label text of a TextResponse block.
 * Manages state updates and command history for undo/redo functionality.
 *
 * @returns {ReactElement} The Label component.
 */
export function Label(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseLabelUpdate] = useMutation<
    TextResponseLabelUpdate,
    TextResponseLabelUpdateVariables
  >(TEXT_RESPONSE_LABEL_UPDATE)
  const { state, dispatch } = useEditor()
  const {
    add,
    state: { undo }
  } = useCommand()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined
  const [value, setValue] = useState(selectedBlock?.label ?? '')
  const [commandInput, setCommandInput] = useState({ id: uuidv4(), value })

  useEffect(() => {
    if (undo == null || undo.id === commandInput.id) return
    resetCommandInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    setValue(selectedBlock?.label ?? '')
  }, [selectedBlock?.label])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  function handleSubmit(value: string): void {
    if (selectedBlock == null) return

    add({
      id: commandInput.id,
      parameters: {
        execute: {
          label: value,
          context: {},
          runDispatch: false
        },
        undo: {
          label: commandInput.value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        },
        redo: {
          label: value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        }
      },
      execute({ label, context, runDispatch }) {
        if (runDispatch)
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep: state.selectedStep,
            selectedAttributeId: state.selectedAttributeId
          })

        void textResponseLabelUpdate({
          variables: {
            id: selectedBlock.id,
            label
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              label,
              __typename: 'TextResponseBlock'
            }
          },
          context: {
            debounceKey: `TextResponseBlock:${selectedBlock.id}`,
            ...context
          }
        })
      }
    })
  }

  return (
    <Box sx={{ p: 4, pt: 0 }} data-testid="Label">
      <TextField
        id="label"
        name="label"
        variant="filled"
        label={t('Label')}
        placeholder={t('Your label here')}
        fullWidth
        slotProps={{
          htmlInput: {
            maxLength: 250
          }
        }}
        value={value}
        onFocus={resetCommandInput}
        onChange={(e) => {
          setValue(e.target.value)
          handleSubmit(e.target.value)
        }}
      />
    </Box>
  )
}
