import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
<<<<<<< HEAD

import { Typography } from '@core/journeys/ui/Typography'
import type { TreeBlock } from '@core/journeys/ui/block'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
=======
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { Typography } from '@core/journeys/ui/Typography'

>>>>>>> main
import {
  TypographyBlockUpdateContent,
  TypographyBlockUpdateContentVariables
} from '../../../../../../../../__generated__/TypographyBlockUpdateContent'
import { TypographyFields } from '../../../../../../../../__generated__/TypographyFields'
import { InlineEditInput } from '../InlineEditInput'

export const TYPOGRAPHY_BLOCK_UPDATE_CONTENT = gql`
<<<<<<< HEAD
  mutation TypographyBlockUpdateContent(
    $id: ID!
    $content: String!
  ) {
=======
  mutation TypographyBlockUpdateContent($id: ID!, $content: String!) {
>>>>>>> main
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

  const [value, setValue] = useState(content)
  const [commandInput, setCommandInput] = useState({ id: uuidv4(), value })
  const [selection, setSelection] = useState({ start: 0, end: value.length })
<<<<<<< HEAD
  const { add } = useCommand()
=======
  const {
    add,
    state: { undo }
  } = useCommand()
>>>>>>> main
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()

  useEffect(() => {
<<<<<<< HEAD
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
=======
    if (undo == null || undo.id === commandInput.id) return
    resetCommandInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    setValue(content)
  }, [content])

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
>>>>>>> main
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
<<<<<<< HEAD
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
=======
            debounceKey: `${props?.__typename}:${id}`,
            ...context
>>>>>>> main
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
<<<<<<< HEAD
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
=======
            if (ref != null) ref.focus()
          }}
          onFocus={(e) => {
            const target = e.currentTarget as HTMLInputElement
            target.setSelectionRange(selection.start, selection.end)
            resetCommandInput()
          }}
>>>>>>> main
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
