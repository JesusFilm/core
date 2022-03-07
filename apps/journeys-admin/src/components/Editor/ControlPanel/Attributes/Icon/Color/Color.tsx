import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { IconColor } from '../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../ColorDisplayIcon'
import { useJourney } from '../../../../../../libs/context'
import { ToggleButtonGroup } from '../../ToggleButtonGroup'
import { IconBlockColorUpdate } from '../../../../../../../__generated__/IconBlockColorUpdate'

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

interface ColorProps {
  id: string
  color: IconColor
}

export function Color({ id, color }: ColorProps): ReactElement {
  const [iconBlockColorUpdate] = useMutation<IconBlockColorUpdate>(
    ICON_BLOCK_COLOR_UPDATE
  )

  const journey = useJourney()

  async function handleChange(newColor: IconColor): Promise<void> {
    if (newColor !== color && newColor != null) {
      await iconBlockColorUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            color: newColor
          }
        },
        optimisticResponse: {
          iconBlockUpdate: {
            __typename: 'IconBlock',
            id,
            color: newColor
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
      value={color}
      onChange={handleChange}
      options={options}
    />
  )
}
