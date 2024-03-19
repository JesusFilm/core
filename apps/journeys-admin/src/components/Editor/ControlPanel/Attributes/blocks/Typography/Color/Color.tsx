import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../../__generated__/GetJourney'
import { TypographyColor } from '../../../../../../../../__generated__/globalTypes'
import { TypographyBlockUpdateColor } from '../../../../../../../../__generated__/TypographyBlockUpdateColor'
import { ColorDisplayIcon } from '../../../../ColorDisplayIcon'
import { ToggleButtonGroup } from '../../../ToggleButtonGroup'

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
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateColor>(
    TYPOGRAPHY_BLOCK_UPDATE_COLOR
  )

  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  async function handleChange(color: TypographyColor): Promise<void> {
    if (selectedBlock != null && color != null && journey != null) {
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
      label: t('Primary'),
      icon: <ColorDisplayIcon color={TypographyColor.primary} />
    },
    {
      value: TypographyColor.secondary,
      label: t('Secondary'),
      icon: <ColorDisplayIcon color={TypographyColor.secondary} />
    },
    {
      value: TypographyColor.error,
      label: t('Error'),
      icon: <ColorDisplayIcon color={TypographyColor.error} />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.color ?? TypographyColor.primary}
      onChange={handleChange}
      options={options}
      testId="Color"
    />
  )
}
