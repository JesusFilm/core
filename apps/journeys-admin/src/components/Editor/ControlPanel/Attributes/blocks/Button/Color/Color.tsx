import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { ButtonColor } from '../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../../ColorDisplayIcon'
import { ButtonBlockUpdateColor } from '../../../../../../../../__generated__/ButtonBlockUpdateColor'
import { useJourney } from '../../../../../../../libs/context'
import { ToggleButtonGroup } from '../../../ToggleButtonGroup'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../__generated__/GetJourney'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateColor(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      color
    }
  }
`

export function Color(): ReactElement {
  const [buttonBlockUpdate] =
    useMutation<ButtonBlockUpdateColor>(BUTTON_BLOCK_UPDATE)

  const journey = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  async function handleChange(color: ButtonColor): Promise<void> {
    if (selectedBlock != null && color != null && journey != null) {
      await buttonBlockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { color }
        },
        optimisticResponse: {
          buttonBlockUpdate: {
            id: selectedBlock.id,
            color,
            __typename: 'ButtonBlock'
          }
        }
      })
    }
  }

  const options = [
    {
      value: ButtonColor.primary,
      label: 'Primary',
      icon: <ColorDisplayIcon color={ButtonColor.primary} />
    },
    {
      value: ButtonColor.secondary,
      label: 'Secondary',
      icon: <ColorDisplayIcon color={ButtonColor.secondary} />
    },
    {
      value: ButtonColor.error,
      label: 'Error',
      icon: <ColorDisplayIcon color={ButtonColor.error} />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.buttonColor ?? ButtonColor.primary}
      onChange={handleChange}
      options={options}
    />
  )
}
