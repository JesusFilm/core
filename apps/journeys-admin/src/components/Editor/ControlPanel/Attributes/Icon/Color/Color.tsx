import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { IconColor } from '../../../../../../../__generated__/globalTypes'
import { IconBlockColorUpdate } from '../../../../../../../__generated__/IconBlockColorUpdate'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { ColorDisplayIcon } from '../../../ColorDisplayIcon'
import { ToggleButtonGroup } from '../../ToggleButtonGroup'

export const ICON_BLOCK_COLOR_UPDATE = gql`
  mutation IconBlockColorUpdate(
    $id: ID!
    $journeyId: ID!
    $input: IconBlockUpdateInput!
  ) {
    iconBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      color
    }
  }
`

interface ColorProps extends Pick<TreeBlock<IconFields>, 'id' | 'iconColor'> {}

export function Color({ id, iconColor }: ColorProps): ReactElement {
  const [iconBlockColorUpdate] = useMutation<IconBlockColorUpdate>(
    ICON_BLOCK_COLOR_UPDATE
  )
  const { journey } = useJourney()

  async function handleChange(color: IconColor): Promise<void> {
    if (color !== iconColor && color != null && journey != null) {
      await iconBlockColorUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            color
          }
        },
        optimisticResponse: {
          iconBlockUpdate: {
            __typename: 'IconBlock',
            id,
            color
          }
        }
      })
    }
  }

  const options = [
    {
      value: IconColor.inherit,
      label: 'Default',
      icon: <ColorDisplayIcon color={IconColor.inherit} />
    },
    {
      value: IconColor.primary,
      label: 'Primary',
      icon: <ColorDisplayIcon color={IconColor.primary} />
    },
    {
      value: IconColor.secondary,
      label: 'Secondary',
      icon: <ColorDisplayIcon color={IconColor.secondary} />
    },
    {
      value: IconColor.error,
      label: 'Error',
      icon: <ColorDisplayIcon color={IconColor.error} />
    }
  ]

  return (
    <ToggleButtonGroup
      value={iconColor ?? IconColor.inherit}
      onChange={handleChange}
      options={options}
      testId="Color"
    />
  )
}
