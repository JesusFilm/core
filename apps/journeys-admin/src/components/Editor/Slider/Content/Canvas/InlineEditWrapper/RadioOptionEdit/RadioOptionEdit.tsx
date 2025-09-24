import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { RadioOption } from '@core/journeys/ui/RadioOption'
import { resolveJourneyCustomizationString } from '@core/journeys/ui/resolveJourneyCustomizationString'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  RadioOptionBlockUpdateContent,
  RadioOptionBlockUpdateContentVariables
} from '../../../../../../../../__generated__/RadioOptionBlockUpdateContent'
import { RadioOptionFields } from '../../../../../../../../__generated__/RadioOptionFields'
import { InlineEditInput } from '../InlineEditInput'

export const RADIO_OPTION_BLOCK_UPDATE_CONTENT = gql`
  mutation RadioOptionBlockUpdateContent(
    $id: ID!
    $input: RadioOptionBlockUpdateInput!
  ) {
    radioOptionBlockUpdate(id: $id, input: $input) {
      id
      label
    }
  }
`
interface RadioOptionEditProps extends TreeBlock<RadioOptionFields> {}

export function RadioOptionEdit({
  id,
  label,
  ...radioOptionProps
}: RadioOptionEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const resolvedLabel = !journey?.template
    ? (resolveJourneyCustomizationString(
        label,
        journey?.journeyCustomizationFields ?? []
      ) ?? label)
    : label

  const [radioOptionBlockUpdate] = useMutation<
    RadioOptionBlockUpdateContent,
    RadioOptionBlockUpdateContentVariables
  >(RADIO_OPTION_BLOCK_UPDATE_CONTENT)

  const [value, setValue] = useState(resolvedLabel)
  const [commandInput, setCommandInput] = useState({ id: uuidv4(), value })
  const [selection, setSelection] = useState({ start: 0, end: value.length })

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
    if (value !== resolvedLabel) setValue(resolvedLabel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedLabel])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  function handleSubmit(value: string): void {
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
            selectedStep
          })
        void radioOptionBlockUpdate({
          variables: {
            id,
            input: { label }
          },
          optimisticResponse: {
            radioOptionBlockUpdate: {
              id,
              __typename: 'RadioOptionBlock',
              label
            }
          },
          context: {
            debounceKey: `RadioOptionBlock:${id}`,
            ...context
          }
        })
      }
    })
  }

  return (
    <RadioOption
      {...radioOptionProps}
      id={id}
      label={label}
      editableLabel={
        <InlineEditInput
          name="radioOptionLabel"
          fullWidth
          multiline
          inputRef={(ref) => {
            if (ref != null) ref.focus()
          }}
          autoFocus
          onFocus={(e) => {
            const target = e.currentTarget as HTMLInputElement
            target.setSelectionRange(selection.start, selection.end)
            resetCommandInput()
          }}
          value={value}
          placeholder={t('Add your text here...')}
          onSelect={(e) => {
            const input = e.target as HTMLInputElement
            setSelection({
              start: input.selectionStart ?? 0,
              end: input.selectionEnd ?? value.length
            })
          }}
          onChange={(e) => {
            setValue(e.currentTarget.value)
            handleSubmit(e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
        />
      }
    />
  )
}
