import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TextResponse } from '@core/journeys/ui/TextResponse'

import { TextResponseBlockUpdateContent } from '../../../../../../__generated__/TextResponseBlockUpdateContent'
import { TextResponseFields } from '../../../../../../__generated__/TextResponseFields'
import { InlineEditInput } from '../InlineEditInput'
import { useOnClickOutside } from '../useOnClickOutside/useOnClickOutside'

export const TEXT_RESPONSE_BLOCK_UPDATE_CONTENT = gql`
  mutation TextResponseBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      submitLabel
    }
  }
`
interface TextResponseEditProps extends TreeBlock<TextResponseFields> {}

export function TextResponseEdit({
  id,
  submitLabel,
  ...textResponseProps
}: TextResponseEditProps): ReactElement {
  const [textResponseBlockUpdate] = useMutation<TextResponseBlockUpdateContent>(
    TEXT_RESPONSE_BLOCK_UPDATE_CONTENT
  )

  const { journey } = useJourney()
  const [value, setValue] = useState(submitLabel ?? '')

  async function handleSaveBlock(): Promise<void> {
    const currentSubmitLabel = value.trim().replace(/\n/g, '')
    if (journey == null || submitLabel === currentSubmitLabel) return

    await textResponseBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { submitLabel: currentSubmitLabel }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id,
          __typename: 'TextResponseBlock',
          submitLabel: currentSubmitLabel
        }
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
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <TextResponse
      {...textResponseProps}
      id={id}
      submitLabel={submitLabel}
      editableSubmitLabel={input}
      sx={{
        '&:hover': {
          backgroundColor: 'primary.main'
        }
      }}
    />
  )
}
