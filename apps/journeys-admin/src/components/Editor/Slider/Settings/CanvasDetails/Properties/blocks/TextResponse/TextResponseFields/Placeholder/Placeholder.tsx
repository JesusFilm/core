import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useGetValueFromJourneyCustomizationString } from '@core/journeys/ui/useGetValueFromJourneyCustomizationString'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponsePlaceholderUpdate,
  TextResponsePlaceholderUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponsePlaceholderUpdate'

/**
 * GraphQL mutation for updating the placeholder text in a TextResponse block.
 */
export const TEXT_RESPONSE_PLACEHOLDER_UPDATE = gql`
  mutation TextResponsePlaceholderUpdate($id: ID!, $placeholder: String!) {
    textResponseBlockUpdate(id: $id, input: { placeholder: $placeholder }) {
      id
      placeholder
    }
  }
`

/**
 * A component that renders a text field for editing the placeholder text of a TextResponse block.
 * Manages state updates and command history for undo/redo functionality.
 *
 * @returns {ReactElement} The Placeholder component.
 */
export function Placeholder(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponsePlaceholderUpdate] = useMutation<
    TextResponsePlaceholderUpdate,
    TextResponsePlaceholderUpdateVariables
  >(TEXT_RESPONSE_PLACEHOLDER_UPDATE)
  const { state, dispatch } = useEditor()
  const {
    add,
    state: { undo }
  } = useCommand()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined
  const [value, setValue] = useState(selectedBlock?.placeholder ?? '')
  const [commandInput, setCommandInput] = useState({ id: uuidv4(), value })

  useEffect(() => {
    if (undo == null || undo.id === commandInput.id) return
    resetCommandInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    setValue(selectedBlock?.placeholder ?? '')
  }, [selectedBlock?.placeholder])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  function handleSubmit(value: string): void {
    if (selectedBlock == null) return
    add({
      id: commandInput.id,
      parameters: {
        execute: {
          placeholder: value,
          context: {},
          runDispatch: false
        },
        undo: {
          placeholder: commandInput.value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        },
        redo: {
          placeholder: value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        }
      },
      execute({ placeholder, context, runDispatch }) {
        if (runDispatch)
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep: state.selectedStep,
            selectedAttributeId: state.selectedAttributeId
          })

        void textResponsePlaceholderUpdate({
          variables: {
            id: selectedBlock.id,
            placeholder
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              placeholder,
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
    <Box sx={{ p: 4, pt: 0 }} data-testid="Placeholder">
      <TextField
        id="placeholder"
        name="placeholder"
        variant="filled"
        label={t('Placeholder')}
        placeholder={t('Your placeholder here')}
        fullWidth
        slotProps={{
          htmlInput: {
            maxLength: 250
          }
        }}
        value={useGetValueFromJourneyCustomizationString(value) ?? value}
        onFocus={resetCommandInput}
        onChange={(e) => {
          setValue(e.target.value)
          handleSubmit(e.target.value)
        }}
      />
    </Box>
  )
}
