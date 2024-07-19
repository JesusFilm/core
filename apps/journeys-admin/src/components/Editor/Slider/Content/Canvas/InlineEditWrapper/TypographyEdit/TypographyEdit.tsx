import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { Typography } from '@core/journeys/ui/Typography'
import type { TreeBlock } from '@core/journeys/ui/block'
import { hasTouchScreen } from '@core/shared/ui/deviceUtils'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import {
  TypographyBlockUpdateContent,
  TypographyBlockUpdateContentVariables
} from '../../../../../../../../__generated__/TypographyBlockUpdateContent'
import { TypographyFields } from '../../../../../../../../__generated__/TypographyFields'
import { InlineEditInput } from '../InlineEditInput'
import { useOnClickOutside } from '../useOnClickOutside'

export const TYPOGRAPHY_BLOCK_UPDATE_CONTENT = gql`
  mutation TypographyBlockUpdateContent(
    $id: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, input: $input) {
      id
      content
    }
  }
`
interface TypographyEditProps extends TreeBlock<TypographyFields> {
  deleteSelf: () => void
}

export function TypographyEdit({
  id,
  variant,
  align,
  color,
  content,
  deleteSelf,
  ...props
}: TypographyEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<
    TypographyBlockUpdateContent,
    TypographyBlockUpdateContentVariables
  >(TYPOGRAPHY_BLOCK_UPDATE_CONTENT)

  const [value, setValue] = useState(content)
  const [selection, setSelection] = useState({ start: 0, end: value.length })
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  async function handleSaveBlock(): Promise<void> {
    const currentContent = value.trimStart().trimEnd()

    if (currentContent === '') {
      deleteSelf()
      return
    }

    if (content === currentContent) return

    await add({
      parameters: {
        execute: { content: currentContent },
        undo: { content }
      },
      async execute({ content }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep
        })

        await typographyBlockUpdate({
          variables: {
            id,
            input: { content }
          },
          optimisticResponse: {
            typographyBlockUpdate: {
              id,
              __typename: 'TypographyBlock',
              content
            }
          }
        })
      }
    })
  }

  const inputRef = useOnClickOutside(async () => {
    await handleSaveBlock()
  })

  const input = (
    <InlineEditInput
      name={`edit-${id}`}
      ref={inputRef}
      multiline
      fullWidth
      autoFocus={!hasTouchScreen()}
      value={value}
      placeholder={t('Add your text here...')}
      onSelect={(e) => {
        const input = e.target as HTMLTextAreaElement
        setSelection({
          start: input.selectionStart ?? 0,
          end: input.selectionEnd ?? value.length
        })
      }}
      onFocus={(e) => {
        const input = e.target as HTMLTextAreaElement
        input.setSelectionRange(selection.start, selection.end)
      }}
      onBlur={handleSaveBlock}
      onChange={(e) => setValue(e.target.value)}
    />
  )

  return (
    <Typography
      {...props}
      id={id}
      variant={variant}
      align={align}
      color={color}
      content={content}
      editableContent={input}
    />
  )
}
