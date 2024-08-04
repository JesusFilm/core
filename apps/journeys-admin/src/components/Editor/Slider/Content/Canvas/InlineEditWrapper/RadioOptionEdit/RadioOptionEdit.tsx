import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { RadioOption } from '@core/journeys/ui/RadioOption'

import {
  RadioOptionBlockUpdateContent,
  RadioOptionBlockUpdateContentVariables
} from '../../../../../../../../__generated__/RadioOptionBlockUpdateContent'
import { RadioOptionFields } from '../../../../../../../../__generated__/RadioOptionFields'
import { InlineEditInput } from '../InlineEditInput'
import { useOnClickOutside } from '../useOnClickOutside'

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
  const [radioOptionBlockUpdate] = useMutation<
    RadioOptionBlockUpdateContent,
    RadioOptionBlockUpdateContentVariables
  >(RADIO_OPTION_BLOCK_UPDATE_CONTENT)
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const [value, setValue] = useState(
    label === 'Option 1' || label === 'Option 2' ? '' : label
  )

  async function handleSaveBlock(): Promise<void> {
    const currentLabel = value.trim().replace(/\n/g, '')
    if (label === currentLabel) return

    await add({
      parameters: {
        execute: { label: currentLabel },
        undo: { label }
      },
      async execute({ label }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep
        })

        await radioOptionBlockUpdate({
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
      placeholder={t('Type your text here...')}
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <RadioOption
      {...radioOptionProps}
      id={id}
      label={label}
      editableLabel={input}
    />
  )
}
