import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useRef, useState } from 'react'

import { Typography } from '@core/journeys/ui/Typography'
import type { TreeBlock } from '@core/journeys/ui/block'
import { hasTouchScreen } from '@core/shared/ui/deviceUtils'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { SubmitListener } from '@core/shared/ui/SubmitListener'
import { Formik } from 'formik'
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
interface TypographyEditProps extends TreeBlock<TypographyFields> {}

export function TypographyEdit({
  id,
  variant,
  align,
  color,
  content,
  ...props
}: TypographyEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<
    TypographyBlockUpdateContent,
    TypographyBlockUpdateContentVariables
  >(TYPOGRAPHY_BLOCK_UPDATE_CONTENT)

  const typog = useRef<HTMLInputElement>()

  const [selection, setSelection] = useState({ start: 0, end: content.length })
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const initialValues: { contentLabel: string } = {
    contentLabel: content ?? ''
  }

  async function handleSaveBlock(values: typeof initialValues): Promise<void> {
    const currentContent = values.contentLabel.trimStart().trimEnd()

    // if (content === currentContent) return

    // if (selectedBlock != null) {
    await add({
      parameters: {
        execute: { content: currentContent },
        undo: { content }
      },
      async execute({ content }) {
        console.log('here')
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

    // }
  }

  const inputRef = useOnClickOutside(async () => {
    // await handleSaveBlock
    if (typog.current != null) typog.current.blur()
  })

  const input = (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSaveBlock}
      enableReinitialize
    >
      {({ values, handleChange, setFieldValue }) => (
        <>
          <InlineEditInput
            name="contentLabel"
            ref={inputRef}
            inputRef={typog}
            multiline
            fullWidth
            autoFocus={!hasTouchScreen()}
            value={values.contentLabel}
            placeholder={t('Add your text here...')}
            onSelect={(e) => {
              const input = e.target as HTMLTextAreaElement
              setSelection({
                start: input.selectionStart ?? 0,
                end: input.selectionEnd ?? values.contentLabel.length
              })
            }}
            onFocus={(e) => {
              const input = e.target as HTMLTextAreaElement
              input.setSelectionRange(selection.start, selection.end)
            }}
            onBlur={(e) => {
              setFieldValue('contentLabel', e.currentTarget.value)
              dispatch({
                type: 'SetEditorFocusAction',
                selectedStep: selectedStep,
                selectedBlock: selectedStep
              })
            }}
            onChange={handleChange}
          />
          <SubmitListener />
        </>
      )}
    </Formik>
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
