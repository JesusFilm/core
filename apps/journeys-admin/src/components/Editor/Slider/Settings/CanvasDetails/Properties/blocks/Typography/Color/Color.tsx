import { gql, useMutation } from '@apollo/client'
import { type ReactElement, useRef, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyColor } from '../../../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../controls/ColorDisplayIcon'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { debounce } from 'lodash'
import { HexColorPicker } from 'react-colorful'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import {
  TypographyBlockUpdateColor,
  TypographyBlockUpdateColorVariables
} from '../../../../../../../../../../__generated__/TypographyBlockUpdateColor'

export const TYPOGRAPHY_BLOCK_UPDATE_COLOR = gql`
  mutation TypographyBlockUpdateColor($id: ID!, $color: TypographyColor!) {
    typographyBlockUpdate(id: $id, input: { color: $color }) {
      id
      customColor
    }
  }
`

export function Color(): ReactElement {
  const theme = useTheme()
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

  const [selectedColor, setSelectedColor] = useState(
    selectedBlock?.customColor ?? theme.palette.primary.main
  )

  const handleColorChange = async (color: string): Promise<void> => {
    void debouncedColorChange(color.toUpperCase())
  }

  const debouncedColorChange = useRef(
    debounce(async (color: string) => {
      void changeTypographyColor(color)
      setSelectedColor(color)
    }, 100)
  ).current

  function changeTypographyColor(color: string): void {
    if (selectedBlock == null || color == null) return

      add({
        parameters: {
          execute: { color },
          undo: {
            customColor: selectedBlock.customColor
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
              customColor: color
            },
            optimisticResponse: {
              typographyBlockUpdate: {
                id: selectedBlock.id,
                customColor: color,
                __typename: 'TypographyBlock'
              }
            }
          })
        }
      })
  }

  return (
    <Box sx={{ px: 4, pb: 4 }}>
      <HexColorPicker
        data-testid="TextColorPicker"
        color={selectedColor}
        onChange={handleColorChange}
        style={{ width: '100%', height: 125 }}
      />
    </Box>
  )
}
