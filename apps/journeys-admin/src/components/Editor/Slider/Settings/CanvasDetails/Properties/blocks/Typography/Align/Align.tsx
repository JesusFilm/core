import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import AlignRightIcon from '@core/shared/ui/icons/AlignRight'

import { Command, useCommand } from '@core/journeys/ui/CommandProvider'
import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyBlockUpdateAlign } from '../../../../../../../../../../__generated__/TypographyBlockUpdateAlign'
import { TypographyAlign } from '../../../../../../../../../../__generated__/globalTypes'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const TYPOGRAPHY_BLOCK_UPDATE_ALIGN = gql`
  mutation TypographyBlockUpdateAlign(
    $id: ID!
    $journeyId: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      align
    }
  }
`

export function Align(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateAlign>(
    TYPOGRAPHY_BLOCK_UPDATE_ALIGN
  )
  const { add } = useCommand()
  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  async function handleChange(align: TypographyAlign): Promise<void> {
    if (selectedBlock != null && align != null && journey != null) {
      await add({
        parameters: {
          execute: { id: selectedBlock.id, journeyId: journey.id, align },
          undo: {
            id: selectedBlock.id,
            journeyId: journey.id,
            align: selectedBlock.align
          }
        },
        async execute({ id, journeyId, align }) {
          await typographyBlockUpdate({
            variables: {
              id,
              journeyId,
              input: { align }
            },
            optimisticResponse: {
              typographyBlockUpdate: {
                id,
                align,
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
      value: TypographyAlign.left,
      label: t('Left'),
      icon: <AlignLeftIcon />
    },
    {
      value: TypographyAlign.center,
      label: t('Center'),
      icon: <AlignCenterIcon />
    },
    {
      value: TypographyAlign.right,
      label: t('Right'),
      icon: <AlignRightIcon />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.align ?? TypographyAlign.left}
      onChange={handleChange}
      options={options}
      testId="Align"
    />
  )
}
