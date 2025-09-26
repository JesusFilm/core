import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { Typography } from '@core/journeys/ui/Typography'

import {
  TypographyBlockUpdateContent,
  TypographyBlockUpdateContentVariables
} from '../../../../../../../../__generated__/TypographyBlockUpdateContent'
import { TypographyFields } from '../../../../../../../../__generated__/TypographyFields'
import { InlineEditInput } from '../InlineEditInput'
import { resolveJourneyCustomizationString } from '@core/journeys/ui/resolveJourneyCustomizationString'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

export const TYPOGRAPHY_BLOCK_UPDATE_CONTENT = gql`
  mutation TypographyBlockUpdateContent($id: ID!, $content: String!) {
    typographyBlockUpdate(id: $id, input: { content: $content }) {
      id
      content
    }
  }
`
export function TypographyEdit({
  id,
  content,
  ...props
}: TreeBlock<TypographyFields>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<
    TypographyBlockUpdateContent,
    TypographyBlockUpdateContentVariables
  >(TYPOGRAPHY_BLOCK_UPDATE_CONTENT)
  const { journey } = useJourney()

  const resolvedContent = !journey?.template
    ? (resolveJourneyCustomizationString(
        content,
        journey?.journeyCustomizationFields ?? []
      ) ?? content)
    : content

  const [value, setValue] = useState(resolvedContent)

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
    if (value !== resolvedContent) setValue(resolvedContent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedContent])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  function handleSubmit(value: string): void {
    add({
      id: commandInput.id,
      parameters: {
        execute: {
          content: value,
          context: {},
          runDispatch: false
        },
        undo: {
          content: commandInput.value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        },
        redo: {
          content: value,
          context: { debounceTimeout: 1 },
          runDispatch: true
        }
      },
      execute({ content, context, runDispatch }) {
        if (runDispatch)
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep
          })
        void typographyBlockUpdate({
          variables: {
            id,
            content
          },
          optimisticResponse: {
            typographyBlockUpdate: {
              id,
              __typename: 'TypographyBlock',
              content
            }
          },
          context: {
            debounceKey: `TypographyBlock:${id}`,
            ...context
          }
        })
      }
    })
  }

  return (
    <Typography
      {...props}
      id={id}
      content={content}
      editableContent={
        <InlineEditInput
          name="contentLabel"
          fullWidth
          multiline
          inputRef={(ref) => {
            if (ref != null) ref.focus()
          }}
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
            setValue(e.target.value)
            handleSubmit(e.target.value)
          }}
        />
      }
    />
  )
}
