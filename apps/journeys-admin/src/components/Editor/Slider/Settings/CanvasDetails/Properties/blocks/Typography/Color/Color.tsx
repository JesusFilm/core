import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { Command, useCommand } from '@core/journeys/ui/CommandProvider'
import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyBlockUpdateColor } from '../../../../../../../../../../__generated__/TypographyBlockUpdateColor'
import { TypographyColor } from '../../../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../controls/ColorDisplayIcon'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

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
  const { add } = useCommand()
  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  async function handleChange(color: TypographyColor): Promise<void> {
    if (selectedBlock != null && color != null && journey != null) {
      await add({
        parameters: {
          execute: { id: selectedBlock.id, journeyId: journey.id, color },
          undo: {
            id: selectedBlock.id,
            journeyId: journey.id,
            color: selectedBlock.color
          }
        },
        async execute({ id, journeyId, color }) {
          await typographyBlockUpdate({
            variables: {
              id,
              journeyId,
              input: { color }
            },
            optimisticResponse: {
              typographyBlockUpdate: {
                id,
                color,
                __typename: 'TypographyBlock'
              }
            }
          })
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
