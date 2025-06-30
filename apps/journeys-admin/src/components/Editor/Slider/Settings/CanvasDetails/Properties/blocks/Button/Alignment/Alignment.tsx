import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import AlignJustifyIcon from '@core/shared/ui/icons/AlignJustify'
import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import AlignRightIcon from '@core/shared/ui/icons/AlignRight'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ButtonBlockUpdateAlignment,
  ButtonBlockUpdateAlignmentVariables
} from '../../../../../../../../../../__generated__/ButtonBlockUpdateAlignment'
import { ButtonAlignment } from '../../../../../../../../../../__generated__/globalTypes'

// type ButtonAlignment =
//   ButtonBlockUpdateAlignmentVariables['settings']['alignment']

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateAlignment(
    $id: ID!
    $settings: ButtonBlockSettingsInput!
  ) {
    buttonBlockUpdate(id: $id, input: { settings: $settings }) {
      id
      settings {
        alignment
      }
    }
  }
`

export function Alignment(): ReactElement {
  const [buttonBlockUpdate] = useMutation<
    ButtonBlockUpdateAlignment,
    ButtonBlockUpdateAlignmentVariables
  >(BUTTON_BLOCK_UPDATE)

  const { state, dispatch } = useEditor()
  const { add } = useCommand()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [alignment, setAlignment] = useState<ButtonAlignment>(
    ButtonAlignment.center
  )

  const temp_handleAlignmentChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: ButtonAlignment | null
  ) => {
    if (newAlignment !== null) setAlignment(newAlignment)
  }

  function handleChange(alignment: string): void {
    if (selectedBlock == null || alignment == null) return

    // Map the CSS class values to ButtonAlignment enum values
    const alignmentMap: Record<string, ButtonAlignment> = {
      'justify-start': ButtonAlignment.left,
      'justify-center': ButtonAlignment.center,
      'justify-end': ButtonAlignment.right,
      'justify-evenly': ButtonAlignment.justify
    }

    const buttonAlignment = alignmentMap[alignment]
    if (!buttonAlignment) return

    add({
      parameters: {
        execute: { alignment: buttonAlignment },
        undo: { alignment: selectedBlock.settings?.alignment }
      },
      execute({ alignment }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: state.selectedStep
        })
        void buttonBlockUpdate({
          variables: {
            id: selectedBlock.id,
            settings: {
              alignment
            }
          },
          optimisticResponse: {
            buttonBlockUpdate: {
              id: selectedBlock.id,
              settings: {
                __typename: 'ButtonBlockSettings',
                alignment
              },
              __typename: 'ButtonBlock'
            }
          }
        })
      }
    })
  }

  const options = [
    {
      value: 'justify-start',
      ariaLabel: 'Align Left',
      icon: <AlignLeftIcon />
    },
    {
      value: 'justify-center',
      ariaLabel: 'Align Center',
      icon: <AlignCenterIcon />
    },
    {
      value: 'justify-end',
      ariaLabel: 'Align Right',
      icon: <AlignRightIcon />
    },
    {
      value: 'justify-evenly',
      ariaLabel: 'Align Justify',
      icon: <AlignJustifyIcon />
    }
  ]

  return (
    <Box sx={{ px: 4, pb: 4 }}>
      <ToggleButtonGroup
        value={alignment}
        exclusive
        fullWidth
        onChange={temp_handleAlignmentChange}
        aria-label="Horizontal Alignment"
        sx={{
          borderRadius: 4,
          backgroundColor: 'background.paper',
          boxShadow: 0
        }}
        data-testid="Alignment"
      >
        {options.map((option, idx) => (
          <ToggleButton
            key={option.value}
            value={option.value}
            aria-label={option.ariaLabel}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleChange(option.value)}
            sx={{
              '&:first-of-type': {
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12
              },
              '&:last-of-type': {
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12
              },
              '&.Mui-selected': {
                color: 'primary.main',
                backgroundColor: 'action.selected'
              }
            }}
          >
            {option.icon}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}
