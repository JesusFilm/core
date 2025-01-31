import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ButtonBlockUpdateColor,
  ButtonBlockUpdateColorVariables
} from '../../../../../../../../../../__generated__/ButtonBlockUpdateColor'
import { ButtonColor } from '../../../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../controls/ColorDisplayIcon'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateColor($id: ID!, $color: ButtonColor!) {
    buttonBlockUpdate(id: $id, input: { color: $color }) {
      id
      color
    }
  }
`

export function Color(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [buttonBlockUpdate] = useMutation<
    ButtonBlockUpdateColor,
    ButtonBlockUpdateColorVariables
  >(BUTTON_BLOCK_UPDATE)

  const { state, dispatch } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  function handleChange(color: ButtonColor): void {
    if (selectedBlock == null || color == null) return
    add({
      parameters: {
        execute: { color },
        undo: { color: selectedBlock.buttonColor }
      },
      execute({ color }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep
        })
        void buttonBlockUpdate({
          variables: {
            id: selectedBlock.id,
            color
          },
          optimisticResponse: {
            buttonBlockUpdate: {
              id: selectedBlock.id,
              color,
              __typename: 'ButtonBlock'
            }
          }
        })
      }
    })
  }

  const options = [
    {
      value: ButtonColor.primary,
      label: t('Primary'),
      icon: <ColorDisplayIcon color={ButtonColor.primary} />
    },
    {
      value: ButtonColor.secondary,
      label: t('Secondary'),
      icon: <ColorDisplayIcon color={ButtonColor.secondary} />
    },
    {
      value: ButtonColor.error,
      label: t('Error'),
      icon: <ColorDisplayIcon color={ButtonColor.error} />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.buttonColor ?? ButtonColor.primary}
      onChange={handleChange}
      options={options}
      testId="Color"
    />
  )
}
