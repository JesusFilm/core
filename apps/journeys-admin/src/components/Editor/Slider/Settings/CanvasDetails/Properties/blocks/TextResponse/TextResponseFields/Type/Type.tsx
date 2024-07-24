import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseLabelUpdate,
  TextResponseLabelUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseLabelUpdate'
import {
  TextResponseTypeUpdate,
  TextResponseTypeUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseTypeUpdate'
import {
  TextResponseBlockUpdateInput,
  TextResponseType
} from '../../../../../../../../../../../__generated__/globalTypes'

import { ToggleButtonGroup } from '../../../../controls/ToggleButtonGroup'
import { TEXT_RESPONSE_LABEL_UPDATE } from '../Label/Label'

export const TEXT_RESPONSE_TYPE_UPDATE = gql`
  mutation TextResponseTypeUpdate(
    $id: ID!, 
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, input: $input) {
      id
      type
      integrationId
      routeId
    }
  }
`

export function Type(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { state, dispatch } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  const { add } = useCommand()

  const [textResponseTypeUpdate] = useMutation<
    TextResponseTypeUpdate,
    TextResponseTypeUpdateVariables
  >(TEXT_RESPONSE_TYPE_UPDATE)
  const [textResponseLabelUpdate] = useMutation<
    TextResponseLabelUpdate,
    TextResponseLabelUpdateVariables
  >(TEXT_RESPONSE_LABEL_UPDATE)

  async function handleChange(type: TextResponseType): Promise<void> {
    if (selectedBlock == null) return

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

    await add({
      parameters: {
        execute: { label, input },
        undo: {
          label: selectedBlock.label,
          input: {
            type: selectedBlock.type,
            integrationId: selectedBlock.integrationId,
            routeId: selectedBlock.routeId
          },
          type: selectedBlock.type
        }
      },
      async execute({ label, input }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId
        })

        await Promise.all([
          await textResponseTypeUpdate({
            variables: {
              id: selectedBlock.id,
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
              input: {
                label: label
              }
            },
            optimisticResponse: {
              textResponseBlockUpdate: {
                id: selectedBlock?.id,
                __typename: 'TextResponseBlock',
                label: label
              }
            }
          })
        ])
      }
    })
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
