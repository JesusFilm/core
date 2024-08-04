import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseBlockUpdateInput,
  TextResponseType
} from '../../../../../../../../../../../__generated__/globalTypes'
import { TextResponseLabelUpdate } from '../../../../../../../../../../../__generated__/TextResponseLabelUpdate'
import { TextResponseTypeUpdate } from '../../../../../../../../../../../__generated__/TextResponseTypeUpdate'
import { ToggleButtonGroup } from '../../../../controls/ToggleButtonGroup'
import { TEXT_RESPONSE_LABEL_UPDATE } from '../Label/Label'

export const TEXT_RESPONSE_TYPE_UPDATE = gql`
  mutation TextResponseTypeUpdate(
    $id: ID!
    $journeyId: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      type
      integrationId
      routeId
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
  const [textResponseLabelUpdate] = useMutation<TextResponseLabelUpdate>(
    TEXT_RESPONSE_LABEL_UPDATE
  )

  async function handleChange(type: TextResponseType): Promise<void> {
    if (journey == null || selectedBlock == null) return

    let input: TextResponseBlockUpdateInput = {
      type
    }
    if (type !== TextResponseType.email && type !== TextResponseType.name) {
      input = {
        ...input,
        integrationId: null,
        routeId: null
      }
    }

    let label
    switch (type) {
      case TextResponseType.email:
        label = t('Email')
        break
      case TextResponseType.name:
        label = t('Name')
        break
      default:
        label = t('Your answer here')
    }

    await Promise.all([
      await textResponseTypeUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input
        },
        optimisticResponse: {
          textResponseBlockUpdate: {
            id: selectedBlock.id,
            __typename: 'TextResponseBlock',
            type,
            integrationId: null,
            routeId: null
          }
        }
      }),
      await textResponseLabelUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: {
            label
          }
        },
        optimisticResponse: {
          textResponseBlockUpdate: {
            id: selectedBlock?.id,
            __typename: 'TextResponseBlock',
            label
          }
        }
      })
    ])
  }

  const options = [
    {
      value: TextResponseType.freeForm,
      label: t('Freeform')
    },
    {
      value: TextResponseType.name,
      label: t('Name')
    },
    {
      value: TextResponseType.email,
      label: t('Email')
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
