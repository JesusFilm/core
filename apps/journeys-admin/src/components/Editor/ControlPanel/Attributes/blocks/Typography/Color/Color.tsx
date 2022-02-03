import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { TypographyColor } from '../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../../ColorDisplayIcon'
import { useJourney } from '../../../../../../../libs/context'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../../__generated__/GetJourney'
import { ToggleButtonGroup } from '../../../ToggleButtonGroup'
import { TypographyBlockUpdateColor } from '../../../../../../../../__generated__/TypographyBlockUpdateColor'

export const TYPOGRAPHY_BLOCK_UPDATE_COLOR = gql`
  mutation TypographyBlockUpdateColor(
    $id: ID!
    $journeyId: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      color
    }
  }
`

export function Color(): ReactElement {
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateColor>(
    TYPOGRAPHY_BLOCK_UPDATE_COLOR
  )

  const journey = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  async function handleChange(color: TypographyColor): Promise<void> {
    if (selectedBlock != null && color != null) {
      await typographyBlockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { color }
        },
        optimisticResponse: {
          typographyBlockUpdate: {
            id: selectedBlock.id,
            color,
            __typename: 'TypographyBlock'
          }
        }
      })
    }
  }

  const options = [
    {
      value: TypographyColor.primary,
      label: 'Primary',
      icon: <ColorDisplayIcon color={TypographyColor.primary} />
    },
    {
      value: TypographyColor.secondary,
      label: 'Secondary',
      icon: <ColorDisplayIcon color={TypographyColor.secondary} />
    },
    {
      value: TypographyColor.error,
      label: 'Error',
      icon: <ColorDisplayIcon color={TypographyColor.error} />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.color ?? TypographyColor.primary}
      onChange={handleChange}
      options={options}
    />
  )
}
