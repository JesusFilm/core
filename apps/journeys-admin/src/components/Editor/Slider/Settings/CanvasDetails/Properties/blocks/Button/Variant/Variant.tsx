import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ButtonBlockUpdateVariant,
  ButtonBlockUpdateVariantVariables
} from '../../../../../../../../../../__generated__/ButtonBlockUpdateVariant'
import { ButtonVariant } from '../../../../../../../../../../__generated__/globalTypes'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateVariant($id: ID!, $variant: ButtonVariant!) {
    buttonBlockUpdate(id: $id, input: { variant: $variant }) {
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

  function handleChange(variant: ButtonVariant): void {
    if (selectedBlock == null || variant == null) return
    add({
      parameters: {
        execute: { variant },
        undo: { variant: selectedBlock.buttonVariant }
      },
      execute({ variant }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep
        })
        void buttonBlockUpdate({
          variables: {
            id: selectedBlock.id,
            variant
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

  const { t } = useTranslation('apps-journeys-admin')

  const options = [
    {
      value: t(ButtonVariant.contained),
      label: t('Contained')
    },
    {
      value: t(ButtonVariant.outlined),
      label: t('Outlined')
    },
    {
      value: t(ButtonVariant.text),
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
