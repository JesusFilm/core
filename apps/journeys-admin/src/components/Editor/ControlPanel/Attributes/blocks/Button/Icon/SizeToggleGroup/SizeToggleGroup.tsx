import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui'
import { IconSize } from '../../../../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../../../../libs/context'
import { ToggleButtonGroup } from '../../../../ToggleButtonGroup'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { IconBlockSizeUpdate } from '../../../../../../../../../__generated__/IconBlockSizeUpdate'

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

interface SizeToggleGroupProps {
  iconBlock: TreeBlock<IconFields>
}

// BUG: switching sizes when clicking the same button
export function SizeToggleGroup({
  iconBlock
}: SizeToggleGroupProps): ReactElement {
  const [iconBlockSizeUpdate] = useMutation<IconBlockSizeUpdate>(
    ICON_BLOCK_SIZE_UPDATE
  )
  const [size, setSize] = useState(iconBlock?.iconSize ?? IconSize.md)
  const journey = useJourney()

  async function handleChange(size: IconSize): Promise<void> {
    await iconBlockSizeUpdate({
      variables: {
        id: iconBlock.id,
        journeyId: journey.id,
        input: {
          name: iconBlock.iconName,
          size
        }
      },
      optimisticResponse: {
        iconBlockUpdate: {
          __typename: 'IconBlock',
          id: iconBlock.id,
          size
        }
      }
    })
    setSize(size)
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
    }
  ]

  return (
    <ToggleButtonGroup value={size} onChange={handleChange} options={options} />
  )
}
