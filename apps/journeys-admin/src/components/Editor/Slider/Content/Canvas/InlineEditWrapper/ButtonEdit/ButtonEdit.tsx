import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { Button } from '@core/journeys/ui/Button'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  ButtonBlockUpdateContent,
  ButtonBlockUpdateContentVariables
} from '../../../../../../../../__generated__/ButtonBlockUpdateContent'
import { ButtonFields } from '../../../../../../../../__generated__/ButtonFields'
import { journeyUpdatedAtCacheUpdate } from '../../../../../../../libs/journeyUpdatedAtCacheUpdate'
import { InlineEditInput } from '../InlineEditInput'

export const BUTTON_BLOCK_UPDATE_CONTENT = gql`
  mutation ButtonBlockUpdateContent($id: ID!, $label: String!) {
    buttonBlockUpdate(id: $id, input: { label: $label }) {
      id
      label
    }
  }
`
interface ButtonEditProps extends TreeBlock<ButtonFields> {}

export function ButtonEdit({
  id,
  buttonVariant,
  buttonColor,
  label,
  ...buttonProps
}: ButtonEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [buttonBlockUpdate] = useMutation<
    ButtonBlockUpdateContent,
    ButtonBlockUpdateContentVariables
  >(BUTTON_BLOCK_UPDATE_CONTENT)
  const [value, setValue] = useState(label)
  const [commandInput, setCommandInput] = useState({ id: uuidv4(), value })
  const {
    add,
    state: { undo }
  } = useCommand()
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { journey } = useJourney()

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

  function handleSubmit(value: string): void {
    if (journey != null) {
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
          void buttonBlockUpdate({
            variables: {
              id,
              label
            },
            optimisticResponse: {
              buttonBlockUpdate: {
                id,
                __typename: 'ButtonBlock',
                label
              }
            },
            context: {
              debounceKey: `ButtonBlock:${id}`,
              ...context
            },
            update(cache) {
              journeyUpdatedAtCacheUpdate(cache, journey.id)
            }
          })
        }
      })
    }
  }

  return (
    <Button
      {...buttonProps}
      id={id}
      buttonVariant={buttonVariant}
      buttonColor={buttonColor}
      label={label}
      editableLabel={
        <InlineEditInput
          name="buttonLabel"
          fullWidth
          multiline
          autoFocus
          onFocus={(e) =>
            e.currentTarget.setSelectionRange(
              e.currentTarget.value.length,
              e.currentTarget.value.length
            )
          }
          value={value}
          placeholder={t('Edit text...')}
          onChange={(e) => {
            setValue(e.target.value)
            handleSubmit(e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
        />
      }
    />
  )
}
