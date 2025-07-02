import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  TypographyBlockUpdateColor,
  TypographyBlockUpdateColorVariables
} from '../../../../../../../../../../__generated__/TypographyBlockUpdateColor'
import { ColorDisplayIcon } from '../../../controls/ColorDisplayIcon'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const TYPOGRAPHY_BLOCK_UPDATE_COLOR = gql`
  mutation TypographyBlockUpdateColor(
    $id: ID!
    $settings: TypographyBlockSettingsInput!
  ) {
    typographyBlockUpdate(id: $id, input: { settings: $settings }) {
      id
      settings {
        color
      }
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

  function handleChange(color: string): void {
    if (selectedBlock == null || color == null) return

    add({
      parameters: {
        execute: { color },
        undo: {
          color: selectedBlock.settings?.color
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
            settings: { color }
          },
          optimisticResponse: {
            typographyBlockUpdate: {
              id: selectedBlock.id,
              settings: {
                color,
                __typename: 'TypographyBlockSettings'
              },
              __typename: 'TypographyBlock'
            }
          }
        })
      }
    })
  }

  const options = [
    {
      value: '#C52D3A',
      label: t('Primary'),
      icon: <ColorDisplayIcon color="#C52D3A" />
    },
    {
      value: '#444451',
      label: t('Secondary'),
      icon: <ColorDisplayIcon color="#444451" />
    },
    {
      value: '#B62D1C',
      label: t('Error'),
      icon: <ColorDisplayIcon color="#B62D1C" />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.settings?.color ?? '#C52D3A'}
      onChange={handleChange}
      options={options}
      testId="Color"
    />
  )
}
