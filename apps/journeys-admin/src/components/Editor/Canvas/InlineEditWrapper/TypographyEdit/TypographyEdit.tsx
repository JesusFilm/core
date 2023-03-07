import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Typography } from '@core/journeys/ui/Typography'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'react-i18next'
import { TypographyBlockUpdateContent } from '../../../../../../__generated__/TypographyBlockUpdateContent'
import { TypographyFields } from '../../../../../../__generated__/TypographyFields'
import { InlineEditInput } from '../InlineEditInput'
import { useOnClickOutside } from '../useOnClickOutside'

export const TYPOGRAPHY_BLOCK_UPDATE_CONTENT = gql`
  mutation TypographyBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
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
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateContent>(
    TYPOGRAPHY_BLOCK_UPDATE_CONTENT
  )

  const { journey } = useJourney()
  const [value, setValue] = useState(content)
  const [selection, setSelection] = useState({ start: 0, end: value.length })

  async function handleSaveBlock(): Promise<void> {
    const inputRefValue = inputRef.current?.children[0].innerHTML ?? ''
    const currentContent = inputRefValue.trimStart().trimEnd()

    if (currentContent === '') {
      deleteSelf()
      return
    }

    if (journey == null || content === currentContent) return

    await typographyBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { content: currentContent }
      },
      optimisticResponse: {
        typographyBlockUpdate: {
          id,
          __typename: 'TypographyBlock',
          content: currentContent
        }
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
      autoFocus
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
