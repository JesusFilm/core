import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyColor } from '../../../../../../../../../../__generated__/globalTypes'
import {
  TypographyBlockUpdateColor,
  TypographyBlockUpdateColorVariables
} from '../../../../../../../../../../__generated__/TypographyBlockUpdateColor'
import { ColorDisplayIcon } from '../../../controls/ColorDisplayIcon'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const TYPOGRAPHY_BLOCK_UPDATE_COLOR = gql`
  mutation TypographyBlockUpdateColor($id: ID!, $color: TypographyColor!) {
    typographyBlockUpdate(id: $id, input: { color: $color }) {
      id
      color
    }
  }
`

export function Color(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<
    TypographyBlockUpdateColor,
    TypographyBlockUpdateColorVariables
  >(TYPOGRAPHY_BLOCK_UPDATE_COLOR)
  const { add } = useCommand()
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const selectedBlock = stateSelectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  function handleChange(color: TypographyColor): void {
    if (selectedBlock == null || color == null) return

    add({
      parameters: {
        execute: { color },
        undo: {
          color: selectedBlock.color
        }
      },
      execute({ color }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep,
          selectedBlock
        })
        void typographyBlockUpdate({
          variables: {
            id: selectedBlock.id,
            color
          },
          optimisticResponse: {
            typographyBlockUpdate: {
              id: selectedBlock.id,
              color,
              __typename: 'TypographyBlock'
            }
          }
        })
      }
    })
  }

  const options = [
    {
      value: TypographyColor.primary,
      label: t('Primary'),
      icon: <ColorDisplayIcon color={TypographyColor.primary} />
    },
    {
      value: TypographyColor.secondary,
      label: t('Secondary'),
      icon: <ColorDisplayIcon color={TypographyColor.secondary} />
    },
    {
      value: TypographyColor.error,
      label: t('Error'),
      icon: <ColorDisplayIcon color={TypographyColor.error} />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.color ?? TypographyColor.primary}
      onChange={handleChange}
      options={options}
      testId="Color"
    />
  )
}
