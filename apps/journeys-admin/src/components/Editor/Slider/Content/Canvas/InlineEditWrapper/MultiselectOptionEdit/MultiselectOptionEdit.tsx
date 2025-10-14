import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { MultiselectOption } from '@core/journeys/ui/MultiselectOption/MultiselectOption'

import {
  MultiselectOptionBlockUpdate,
  MultiselectOptionBlockUpdateVariables
} from '../../../../../../../../__generated__/MultiselectOptionBlockUpdate'
import { MultiselectOptionFields } from '../../../../../../../../__generated__/MultiselectOptionFields'
import { InlineEditInput } from '../InlineEditInput'

export const MULTISELECT_OPTION_BLOCK_UPDATE = gql`
  mutation MultiselectOptionBlockUpdate(
    $id: ID!
    $input: MultiselectOptionBlockUpdateInput!
  ) {
    multiselectOptionBlockUpdate(id: $id, input: $input) {
      id
      label
    }
  }
`

export function MultiselectOptionEdit({
  id,
  label,
  ...rest
}: TreeBlock<MultiselectOptionFields>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [updateOption] = useMutation<
    MultiselectOptionBlockUpdate,
    MultiselectOptionBlockUpdateVariables
  >(MULTISELECT_OPTION_BLOCK_UPDATE)

  const [value, setValue] = useState(label)
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
    if (value !== label) setValue(label)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  function handleSubmit(nextLabel: string): void {
    add({
      id: commandInput.id,
      parameters: {
        execute: {
          label: nextLabel,
          context: {},
          runDispatch: false
        },
        undo: {
          label: commandInput.value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        },
        redo: {
          label: nextLabel,
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
        void updateOption({
          variables: { id, input: { label } },
          optimisticResponse: {
            multiselectOptionBlockUpdate: {
              id,
              __typename: 'MultiselectOptionBlock',
              label
            }
          },
          context: {
            debounceKey: `MultiselectOptionBlock:${id}`,
            ...context
          }
        })
      }
    })
  }

  return (
    <MultiselectOption
      {...rest}
      id={id}
      label={label}
      editableLabel={
        <InlineEditInput
          name="multiselectOptionLabel"
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
