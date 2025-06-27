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
// import { ButtonAlignment } from '../../../../../../../../../../__generated__/globalTypes'

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateAlignment($id: ID!, $classNames: String!) {
    buttonBlockUpdate(id: $id, input: { classNames: $classNames }) {
      id
      classNames {
        self
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

  const [alignment, setAlignment] = useState<
    'left' | 'center' | 'right' | 'justify'
  >('left')

  const temp_handleAlignmentChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: 'left' | 'center' | 'right' | 'justify' | null
  ) => {
    if (newAlignment !== null) setAlignment(newAlignment)
  }

  function handleChange(alignment: ButtonAlignment): void {
    if (selectedBlock == null || alignment == null) return
    // add({
    // parameters: {
    //   execute: { alignment },
    //   undo: { alignment: selectedBlock.alignment }
    // },
    // execute({ alignment }) {
    // dispatch({
    //   type: 'SetEditorFocusAction',
    //   selectedBlock,
    //   selectedStep: state.selectedStep
    // })
    // void buttonBlockUpdate({
    //   variables: {
    //     id: selectedBlock.id,
    //     classNames: {
    //       self: alignment
    //     }
    //   },
    //   optimisticResponse: {
    //     buttonBlockUpdate: {
    //       id: selectedBlock.id,
    //       classNames: {
    //         __typename: 'ButtonBlockClassNames',
    //         self: alignment
    //       },
    //       __typename: 'ButtonBlock'
    //     }
    //   }
    // })
    // }
    // })
  }

  const options = [
    {
      value: 'left',
      ariaLabel: 'Align Left',
      icon: <AlignLeftIcon />
    },
    {
      value: 'center',
      ariaLabel: 'Align Center',
      icon: <AlignCenterIcon />
    },
    {
      value: 'right',
      ariaLabel: 'Align Right',
      icon: <AlignRightIcon />
    },
    {
      value: 'justify',
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
