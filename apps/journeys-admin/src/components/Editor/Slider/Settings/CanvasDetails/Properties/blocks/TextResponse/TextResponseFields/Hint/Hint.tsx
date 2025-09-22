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
  TextResponseHintUpdate,
  TextResponseHintUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseHintUpdate'

export const TEXT_RESPONSE_HINT_UPDATE = gql`
  mutation TextResponseHintUpdate($id: ID!, $hint: String!) {
    textResponseBlockUpdate(id: $id, input: { hint: $hint }) {
      id
      hint
    }
  }
`

export function Hint(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseHintUpdate] = useMutation<
    TextResponseHintUpdate,
    TextResponseHintUpdateVariables
  >(TEXT_RESPONSE_HINT_UPDATE)
  const { state, dispatch } = useEditor()
  const {
    add,
    state: { undo }
  } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined
  const [value, setValue] = useState(selectedBlock?.hint ?? '')
  const [commandInput, setCommandInput] = useState({ id: uuidv4(), value })

  useEffect(() => {
    if (undo == null || undo.id === commandInput.id) return
    resetCommandInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    setValue(selectedBlock?.hint ?? '')
  }, [selectedBlock?.hint])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  function handleSubmit(value: string): void {
    if (selectedBlock == null) return
    add({
      id: commandInput.id,
      parameters: {
        execute: {
          hint: value,
          context: {},
          runDispatch: false
        },
        undo: {
          hint: commandInput.value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        },
        redo: {
          hint: value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        }
      },
      execute({ hint, context, runDispatch }) {
        if (runDispatch)
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep: state.selectedStep,
            selectedAttributeId: state.selectedAttributeId
          })

        void textResponseHintUpdate({
          variables: {
            id: selectedBlock.id,
            hint
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              hint,
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
    <Box sx={{ p: 4, pt: 0 }} data-testid="Hint">
      <TextField
        id="hint"
        name="hint"
        variant="filled"
        label={t('Hint')}
        fullWidth
        inputProps={{ maxLength: 250 }}
        value={useGetValueFromJourneyCustomizationString(value)}
        onFocus={resetCommandInput}
        onChange={(e) => {
          setValue(e.target.value)
          handleSubmit(e.target.value)
        }}
      />
    </Box>
  )
}
