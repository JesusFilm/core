import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Button, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { ButtonBlockUpdateContent } from '../../../../../../__generated__/ButtonBlockUpdateContent'
import { ButtonFields } from '../../../../../../__generated__/ButtonFields'
import { InlineEditInput } from '../InlineEditInput'

export const BUTTON_BLOCK_UPDATE_CONTENT = gql`
  mutation ButtonBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
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
  const [buttonBlockUpdate] = useMutation<ButtonBlockUpdateContent>(
    BUTTON_BLOCK_UPDATE_CONTENT
  )
  const journey = useJourney()
  const [value, setValue] = useState(label)

  async function handleSaveBlock(): Promise<void> {
    const label = value.trim().replace(/\n/g, '')
    await buttonBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { label }
      },
      optimisticResponse: {
        buttonBlockUpdate: {
          id,
          __typename: 'ButtonBlock',
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
      onBlur={handleSaveBlock}
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <Button
      {...buttonProps}
      id={id}
      buttonVariant={buttonVariant}
      buttonColor={buttonColor}
      label={label}
      editableLabel={input}
    />
  )
}
