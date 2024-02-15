import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import PaletteIcon from '@core/shared/ui/icons/Palette'

import { journeysAdminConfig } from '../../../../../../../libs/storybook'

import { Button } from '.'

const ButtonStory: Meta<typeof Button> = {
  ...journeysAdminConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/ControlPanel/Button'
}

export const Default: StoryObj<typeof Button> = {
  render: () => {
    return (
      <Box sx={{ width: 285 }}>
        <Button icon={<PaletteIcon />} value="Button" />
      </Box>
    )
  }
}

export const Disabled: StoryObj<typeof Button> = {
  render: () => {
    return (
      <Box sx={{ width: 285 }}>
        <Button icon={<PaletteIcon />} value="Disabled" disabled />
      </Box>
    )
  }
}

export default ButtonStory
