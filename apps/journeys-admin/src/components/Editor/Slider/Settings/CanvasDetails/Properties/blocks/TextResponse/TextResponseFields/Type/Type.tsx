import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import {
  TextResponseBlockUpdateInput,
  TextResponseType
} from '../../../../../../../../../../../__generated__/globalTypes'
import {
  TextResponseTypeUpdate,
  TextResponseTypeUpdateVariables
} from '../../../../../../../../../../../__generated__/TextResponseTypeUpdate'
import { ToggleButtonGroup } from '../../../../controls/ToggleButtonGroup'

export const TEXT_RESPONSE_TYPE_UPDATE = gql`
  mutation TextResponseTypeUpdate(
    $id: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, input: $input) {
      id
      type
      label
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

  function handleChange(type: TextResponseType): void {
    if (selectedBlock == null || type == null) return

    const input: TextResponseBlockUpdateInput = {
      type
    }
    if (type !== TextResponseType.email && type !== TextResponseType.name) {
      input.integrationId = null
      input.routeId = null
    }

    switch (type) {
      case TextResponseType.email:
        input.label = t('Email')
        break
      case TextResponseType.name:
        input.label = t('Name')
        break
      case TextResponseType.phone:
        input.label = t('Phone')
        break
      default:
        input.label = t('Label')
    }

    add({
      parameters: {
        execute: { input },
        undo: {
          input: {
            label: selectedBlock.label,
            type: selectedBlock.type,
            integrationId: selectedBlock.integrationId,
            routeId: selectedBlock.routeId
          }
        }
      },
      execute({ input }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep,
          selectedAttributeId: state.selectedAttributeId
        })
        void textResponseTypeUpdate({
          variables: {
            id: selectedBlock.id,
            input
          },
          optimisticResponse: {
            textResponseBlockUpdate: {
              id: selectedBlock.id,
              __typename: 'TextResponseBlock',
              ...input,
              label: input.label != null ? input.label : selectedBlock.label,
              type: input.type !== undefined ? input.type : selectedBlock.type,
              integrationId:
                input.integrationId !== undefined
                  ? input.integrationId
                  : selectedBlock.integrationId,
              routeId:
                input.routeId !== undefined
                  ? input.routeId
                  : selectedBlock.routeId
            }
          }
        })
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
    },
    {
      value: TextResponseType.phone,
      label: t('Phone')
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
