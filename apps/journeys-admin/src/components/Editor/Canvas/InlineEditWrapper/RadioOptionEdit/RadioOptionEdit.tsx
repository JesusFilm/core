import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { RadioOption } from '@core/journeys/ui/RadioOption'
import { RadioOptionBlockUpdateContent } from '../../../../../../__generated__/RadioOptionBlockUpdateContent'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'
import { InlineEditInput } from '../InlineEditInput'
import { useOnClickOutside } from '../useOnClickOutside'

export const RADIO_OPTION_BLOCK_UPDATE_CONTENT = gql`
  mutation RadioOptionBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: RadioOptionBlockUpdateInput!
  ) {
    radioOptionBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      label
    }
  }
`
interface RadioOptionEditProps extends TreeBlock<RadioOptionFields> {
  visibleCaret?: boolean
}

export function RadioOptionEdit({
  id,
  label,
  visibleCaret,
  ...radioOptionProps
}: RadioOptionEditProps): ReactElement {
  const [radioOptionBlockUpdate] = useMutation<RadioOptionBlockUpdateContent>(
    RADIO_OPTION_BLOCK_UPDATE_CONTENT
  )
  const { journey } = useJourney()
  const [value, setValue] = useState(label)

  async function handleSaveBlock(): Promise<void> {
    const currentLabel = value.trim().replace(/\n/g, '')
    if (journey == null || label === currentLabel) return

    await radioOptionBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { label: currentLabel }
      },
      optimisticResponse: {
        radioOptionBlockUpdate: {
          id,
          __typename: 'RadioOptionBlock',
          label: currentLabel
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
      placeholder="Type your text here..."
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
      sx={visibleCaret ?? true ? {} : { caretColor: 'transparent' }}
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
