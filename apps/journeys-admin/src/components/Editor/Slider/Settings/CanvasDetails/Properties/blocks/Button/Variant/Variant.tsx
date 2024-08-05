import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ButtonBlockUpdateVariant,
  ButtonBlockUpdateVariantVariables
} from '../../../../../../../../../../__generated__/ButtonBlockUpdateVariant'
import { ButtonVariant } from '../../../../../../../../../../__generated__/globalTypes'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateVariant($id: ID!, $input: ButtonBlockUpdateInput!) {
    buttonBlockUpdate(id: $id, input: $input) {
      id
      variant
    }
  }
`

export function Variant(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [buttonBlockUpdate] = useMutation<
    ButtonBlockUpdateVariant,
    ButtonBlockUpdateVariantVariables
  >(BUTTON_BLOCK_UPDATE)

  const { state, dispatch } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  async function handleChange(variant: ButtonVariant): Promise<void> {
    if (selectedBlock != null && variant != null) {
      await add({
        parameters: {
          execute: { variant },
          undo: { variant: selectedBlock.buttonVariant }
        },
        async execute({ variant }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep: state.selectedStep
          })
          await buttonBlockUpdate({
            variables: {
              id: selectedBlock.id,
              input: { variant }
            },
            optimisticResponse: {
              buttonBlockUpdate: {
                id: selectedBlock.id,
                variant,
                __typename: 'ButtonBlock'
              }
            }
          })
        }
      })
    }
  }

  const options = [
    {
      value: ButtonVariant.contained,
      label: t('Contained')
    },
    {
      value: ButtonVariant.text,
      label: t('Text')
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.buttonVariant ?? ButtonVariant.contained}
      onChange={handleChange}
      options={options}
      testId="Variant"
    />
  )
}
