import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ButtonBlockUpdateVariant } from '../../../../../../../../__generated__/ButtonBlockUpdateVariant'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../__generated__/GetJourney'
import { ButtonVariant } from '../../../../../../../../__generated__/globalTypes'
import { ToggleButtonGroup } from '../../../ToggleButtonGroup'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateVariant(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      variant
    }
  }
`

export function Variant(): ReactElement {
  const [buttonBlockUpdate] =
    useMutation<ButtonBlockUpdateVariant>(BUTTON_BLOCK_UPDATE)

  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  async function handleChange(variant: ButtonVariant): Promise<void> {
    if (selectedBlock != null && variant != null && journey != null) {
      await buttonBlockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { variant }
        },
        optimisticResponse: {
          buttonBlockUpdate: {
            id: selectedBlock.id,
            variant,
            __typename: 'ButtonBlock'
          }
        }
      })
    }
  }

  const options = [
    {
      value: ButtonVariant.contained,
      label: 'Contained'
    },
    {
      value: ButtonVariant.text,
      label: 'Text'
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.buttonVariant ?? ButtonVariant.contained}
      onChange={handleChange}
      options={options}
      testId="Variant"
    />
  )
}
