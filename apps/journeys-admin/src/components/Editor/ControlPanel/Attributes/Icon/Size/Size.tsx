import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { IconSize } from '../../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../../libs/context'
import { ToggleButtonGroup } from '../../ToggleButtonGroup'
import { IconBlockSizeUpdate } from '../../../../../../../__generated__/IconBlockSizeUpdate'

export const ICON_BLOCK_SIZE_UPDATE = gql`
  mutation IconBlockSizeUpdate(
    $id: ID!
    $journeyId: ID!
    $input: IconBlockUpdateInput!
  ) {
    iconBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      size
    }
  }
`

interface SizeProps {
  id: string
  size: IconSize
}

export function Size({ id, size }: SizeProps): ReactElement {
  const [iconBlockSizeUpdate] = useMutation<IconBlockSizeUpdate>(
    ICON_BLOCK_SIZE_UPDATE
  )
  const journey = useJourney()

  async function handleChange(newSize: IconSize): Promise<void> {
    if (newSize !== size && newSize != null) {
      await iconBlockSizeUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            size: newSize
          }
        },
        optimisticResponse: {
          iconBlockUpdate: {
            __typename: 'IconBlock',
            id,
            size: newSize
          }
        }
      })
    }
  }

  const options = [
    {
      value: IconSize.sm,
      label: 'Small'
    },
    {
      value: IconSize.md,
      label: 'Medium'
    },
    {
      value: IconSize.lg,
      label: 'Large'
    },
    {
      value: IconSize.xl,
      label: 'Extra Large'
    }
  ]

  return (
    <ToggleButtonGroup value={size} onChange={handleChange} options={options} />
  )
}
