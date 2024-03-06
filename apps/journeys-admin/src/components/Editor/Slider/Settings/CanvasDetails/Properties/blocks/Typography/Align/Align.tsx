import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import AlignRightIcon from '@core/shared/ui/icons/AlignRight'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyAlign } from '../../../../../../../../../../__generated__/globalTypes'
import { TypographyBlockUpdateAlign } from '../../../../../../../../../../__generated__/TypographyBlockUpdateAlign'
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
  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

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

  async function handleChange(align: TypographyAlign): Promise<void> {
    if (selectedBlock != null && align != null && journey != null) {
      await typographyBlockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { align }
        },
        optimisticResponse: {
          typographyBlockUpdate: {
            id: selectedBlock.id,
            align,
            __typename: 'TypographyBlock'
          }
        }
      })
    }
  }

  return (
    <ToggleButtonGroup
      value={selectedBlock?.align ?? TypographyAlign.left}
      onChange={handleChange}
      options={options}
      testId="Align"
    />
  )
}
