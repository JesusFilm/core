import { gql, useMutation } from '@apollo/client'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseTypeUpdate } from '../../../../../../../../../../../__generated__/TextResponseTypeUpdate'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'
import { ToggleButtonGroup } from '../../../../controls/ToggleButtonGroup'

export const TEXT_RESPONSE_TYPE_UPDATE = gql`
  mutation TextResponseTypeUpdate(
    $id: ID!, 
    $journeyId: ID!, 
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      type
    }
  }
`

export function Type(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  const [textResponseTypeUpdate] = useMutation<TextResponseTypeUpdate>(
    TEXT_RESPONSE_TYPE_UPDATE
  )

  async function handleChange(type: TextResponseType): Promise<void> {
    if (journey == null || selectedBlock == null) return
    await textResponseTypeUpdate({
      variables: {
        id: selectedBlock.id,
        journeyId: journey.id,
        input: {
          type
        }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          type
        }
      }
    })
  }

  const options = [
    {
      value: TextResponseType.freeForm,
      label: t('Freeform')
    },
    {
      value: TextResponseType.email,
      label: t('Email')
    },
    {
      value: TextResponseType.name,
      label: t('Name')
    }
  ]

  return (
    <ToggleButtonGroup
      label={t('Type')}
      value={selectedBlock?.type ?? TextResponseType.freeForm}
      onChange={handleChange}
      options={options}
    />
  )
}
