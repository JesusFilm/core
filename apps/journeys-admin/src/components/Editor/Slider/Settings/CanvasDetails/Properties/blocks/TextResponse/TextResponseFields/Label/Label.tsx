import { gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import EyeClosed from '@core/shared/ui/icons/EyeClosed'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseLabelUpdate,
  TextResponseLabelUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseLabelUpdate'
import {
  TextResponseHideLabelUpdate,
  TextResponseHideLabelUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseHideLabelUpdate'
import IconButton from '@mui/material/IconButton'

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

export const TEXT_RESPONSE_HIDE_LABEL_UPDATE = gql`
  mutation TextResponseHideLabelUpdate($id: ID!, $hideLabel: Boolean!) {
    textResponseBlockUpdate(id: $id, input: { hideLabel: $hideLabel }) {
      id
      hideLabel
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
  const [textResponseHideLabelUpdate] = useMutation<
    TextResponseHideLabelUpdate,
    TextResponseHideLabelUpdateVariables
  >(TEXT_RESPONSE_HIDE_LABEL_UPDATE)
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
  const hideLabel = selectedBlock?.hideLabel ?? false

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
    if (selectedBlock == null || selectedBlock.__typename !== 'TextResponseBlock') return

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

  function hideLabelToggle(): void {
    if (selectedBlock == null || selectedBlock.__typename !== 'TextResponseBlock') return

    const newHideLabel = !hideLabel
    const commandId = uuidv4()

    add({
      id: commandId,
      parameters: {
        execute: {
          hideLabel: newHideLabel,
          context: {},
          runDispatch: false
        },
        undo: {
          hideLabel: hideLabel,
          context: { debounceTimeout: 1 },
          runDispatch: true
        },
        redo: {
          hideLabel: newHideLabel,
          context: { debounceTimeout: 1 },
          runDispatch: true
        }
      },
      execute({ hideLabel, context, runDispatch }) {
        if (runDispatch)
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep: state.selectedStep,
            selectedAttributeId: state.selectedAttributeId
          })

        void textResponseHideLabelUpdate({
          variables: {
            id: selectedBlock.id,
            hideLabel
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              hideLabel,
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
    <Stack direction="row" sx={{ p: 4, pt: 0 }} data-testid="Label">
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
      <IconButton
        onClick={hideLabelToggle}
        aria-label={hideLabel ? t('Show label') : t('Hide label')}
        tabIndex={0}
        sx={{ pl: 4 }}
      >
        {hideLabel ? <EyeClosed /> : <EyeOpen />}
      </IconButton>
    </Stack>
  )
}
