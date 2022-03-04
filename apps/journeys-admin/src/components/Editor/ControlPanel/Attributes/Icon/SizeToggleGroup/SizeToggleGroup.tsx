import { ReactElement, useState, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui'
import { IconSize } from '../../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../../libs/context'
import { ToggleButtonGroup } from '../../ToggleButtonGroup'
import { IconFields } from '../../../../../../../__generated__/IconFields'
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

interface SizeToggleGroupProps {
  iconBlock: TreeBlock<IconFields>
}

export function SizeToggleGroup({
  iconBlock
}: SizeToggleGroupProps): ReactElement {
  const [iconBlockSizeUpdate] = useMutation<IconBlockSizeUpdate>(
    ICON_BLOCK_SIZE_UPDATE
  )
  const journey = useJourney()
  const [iconSize, setIconSize] = useState(iconBlock.iconSize ?? IconSize.md)
  useEffect(() => {
    setIconSize(iconBlock.iconSize ?? IconSize.md)
  }, [iconBlock])

  async function handleChange(size: IconSize): Promise<void> {
    if (size !== iconSize && size != null) {
      await iconBlockSizeUpdate({
        variables: {
          id: iconBlock.id,
          journeyId: journey.id,
          input: {
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
      setIconSize(size)
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
    <ToggleButtonGroup
      value={iconSize}
      onChange={handleChange}
      options={options}
    />
  )
}
