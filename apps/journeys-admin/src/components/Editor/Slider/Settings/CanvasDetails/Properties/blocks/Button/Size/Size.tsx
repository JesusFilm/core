import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ButtonBlockUpdateSize } from '../../../../../../../../../../__generated__/ButtonBlockUpdateSize'
import { ButtonSize } from '../../../../../../../../../../__generated__/globalTypes'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateSize(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      size
    }
  }
`

export function Size(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [buttonBlockUpdate] =
    useMutation<ButtonBlockUpdateSize>(BUTTON_BLOCK_UPDATE)

  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  async function handleChange(size: ButtonSize): Promise<void> {
    if (selectedBlock != null && size != null && journey != null) {
      await buttonBlockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { size }
        },
        optimisticResponse: {
          buttonBlockUpdate: {
            id: selectedBlock.id,
            size,
            __typename: 'ButtonBlock'
          }
        }
      })
    }
  }

  const options = [
    {
      value: ButtonSize.small,
      label: t('Small')
    },
    {
      value: ButtonSize.medium,
      label: t('Medium')
    },
    {
      value: ButtonSize.large,
      label: t('Large')
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.size ?? ButtonSize.medium}
      onChange={handleChange}
      options={options}
      testId="Size"
    />
  )
}
