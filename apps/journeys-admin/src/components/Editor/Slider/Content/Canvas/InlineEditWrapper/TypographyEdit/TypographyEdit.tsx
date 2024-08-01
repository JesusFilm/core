import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { Typography } from '@core/journeys/ui/Typography'
import type { TreeBlock } from '@core/journeys/ui/block'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import {
  TypographyBlockUpdateContent,
  TypographyBlockUpdateContentVariables
} from '../../../../../../../../__generated__/TypographyBlockUpdateContent'
import { TypographyFields } from '../../../../../../../../__generated__/TypographyFields'
import { InlineEditInput } from '../InlineEditInput'

export const TYPOGRAPHY_BLOCK_UPDATE_CONTENT = gql`
  mutation TypographyBlockUpdateContent(
    $id: ID!
    $content: String!
  ) {
    typographyBlockUpdate(id: $id, input: { content: $content }) {
      id
      content
    }
  }
`
export function TypographyEdit({
  id,
  content,
  __typename,
  ...props
}: TreeBlock<TypographyFields>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<
    TypographyBlockUpdateContent,
    TypographyBlockUpdateContentVariables
  >(TYPOGRAPHY_BLOCK_UPDATE_CONTENT)

  const [value, setValue] = useState(content)
  const [selection, setSelection] = useState({ start: 0, end: value.length })
  const { add } = useCommand()
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()

  useEffect(() => {
    setValue(content)
  }, [content])

  async function handleSubmit(value: string): Promise<void> {
    await add({
      parameters: {
        execute: { content: value },
        undo: { content }
      },
      async execute({ content }) {
        await typographyBlockUpdate({
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
            debounceKey: `${__typename}:${id}`,
            debounceTimeout: 500
          }
        })
      },
      async undo({ content }) {
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
            debounceKey: `${__typename}:${id}`,
            debounceTimeout: 0
          }
        })
      },
      async redo({ content }) {
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
            debounceKey: `${__typename}:${id}`,
            debounceTimeout: 0
          }
        })
      }
    })
  }

  return (
    <Typography
      {...props}
      __typename={__typename}
      id={id}
      content={content}
      editableContent={
        <InlineEditInput
          name="contentLabel"
          fullWidth
          multiline
          inputRef={(ref) => {
            if (ref) {
              ref.focus()
            }
          }}
          onFocus={(e) =>
            (e.currentTarget as HTMLInputElement).setSelectionRange(
              selection.start,
              selection.end
            )
          }
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
            if (content !== e.target.value.trim())
              handleSubmit(e.target.value.trim())
          }}
        />
      }
    />
  )
}
