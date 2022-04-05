import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { RadioOption, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { RadioOptionBlockUpdateContent } from '../../../../../../__generated__/RadioOptionBlockUpdateContent'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'
import { InlineEditInput } from '../InlineEditInput'

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
interface RadioOptionEditProps extends TreeBlock<RadioOptionFields> {}

export function RadioOptionEdit({
  id,
  label,
  ...radioOptionProps
}: RadioOptionEditProps): ReactElement {
  const [radioOptionBlockUpdate] = useMutation<RadioOptionBlockUpdateContent>(
    RADIO_OPTION_BLOCK_UPDATE_CONTENT
  )
  const journey = useJourney()
  const [value, setValue] = useState(label)

  async function handleSaveBlock(): Promise<void> {
    const label = value.trim().replace(/\n/g, '')
    await radioOptionBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
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

  const input = (
    <InlineEditInput
      name={`edit-${id}`}
      fullWidth
      multiline
      autoFocus
      value={value}
      placeholder="Type your text here..."
      onBlur={handleSaveBlock}
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
