import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { IconSize } from '../../../../../../../../../__generated__/globalTypes'
import { IconType } from '..'
import { ButtonBlockStartIconSizeUpdate } from '../../../../../../../../../__generated__/ButtonBlockStartIconSizeUpdate'
import { ButtonBlockEndIconSizeUpdate } from '../../../../../../../../../__generated__/ButtonBlockEndIconSizeUpdate'
import { useJourney } from '../../../../../../../../libs/context'
import { ToggleButtonGroup } from '../../../../ToggleButtonGroup'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'

interface SizeToggleGroupProps {
  type: IconType
}

export const BUTTON_START_ICON_SIZE_UPDATE = gql`
  mutation ButtonBlockStartIconSizeUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      startIcon {
        size
      }
    }
  }
`

export const BUTTON_END_ICON_SIZE_UPDATE = gql`
  mutation ButtonBlockEndIconSizeUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      endIcon {
        size
      }
    }
  }
`

export function SizeToggleGroup({ type }: SizeToggleGroupProps): ReactElement {
  const [buttonBlockStartIconSizeUpdate] =
    useMutation<ButtonBlockStartIconSizeUpdate>(BUTTON_START_ICON_SIZE_UPDATE)
  const [buttonBlockEndIconSizeUpdate] =
    useMutation<ButtonBlockEndIconSizeUpdate>(BUTTON_END_ICON_SIZE_UPDATE)

  const journey = useJourney()

  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  async function handleChange(size: IconSize): Promise<void> {
    if (selectedBlock != null && size != null) {
      if (type === IconType.start) {
        await buttonBlockStartIconSizeUpdate({
          variables: {
            id: selectedBlock.id,
            journeyId: journey.id,
            input: {
              startIcon: {
                size
              }
            }
          }
        })
      } else {
        await buttonBlockEndIconSizeUpdate({
          variables: {
            id: selectedBlock.id,
            journeyId: journey.id,
            input: {
              endIcon: {
                size
              }
            }
          }
        })
      }
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
    }
  ]

  // Inherit size currently 0 by default
  return (
    <ToggleButtonGroup
      value={
        type === 'start'
          ? selectedBlock?.startIcon?.size ?? IconSize.md
          : selectedBlock?.endIcon?.size ?? IconSize.md
      }
      onChange={handleChange}
      options={options}
    />
  )
}
