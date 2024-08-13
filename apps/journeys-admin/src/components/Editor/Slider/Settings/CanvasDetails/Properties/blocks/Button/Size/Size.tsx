import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ButtonBlockUpdateSize,
  ButtonBlockUpdateSizeVariables
} from '../../../../../../../../../../__generated__/ButtonBlockUpdateSize'
import { ButtonSize } from '../../../../../../../../../../__generated__/globalTypes'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateSize($id: ID!, $size: ButtonSize!) {
    buttonBlockUpdate(id: $id, input: { size: $size }) {
      id
      size
    }
  }
`

export function Size(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [buttonBlockUpdate] = useMutation<
    ButtonBlockUpdateSize,
    ButtonBlockUpdateSizeVariables
  >(BUTTON_BLOCK_UPDATE)

  const { state, dispatch } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  function handleChange(size: ButtonSize): void {
    if (selectedBlock == null || size == null) return
    add({
      parameters: {
        execute: { size },
        undo: { size: selectedBlock.size }
      },
      execute({ size }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep
        })
        void buttonBlockUpdate({
          variables: {
            id: selectedBlock.id,
            size
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
    })
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
