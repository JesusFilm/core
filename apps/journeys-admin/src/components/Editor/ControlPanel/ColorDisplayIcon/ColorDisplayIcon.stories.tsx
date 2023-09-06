import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { TypographyColor } from '../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../libs/storybook'

import { ColorDisplayIcon } from '.'

const ColorDisplayIconStory: Meta<typeof ColorDisplayIcon> = {
  ...simpleComponentConfig,
  component: ColorDisplayIcon,
  title: 'Journeys-Admin/Editor/ControlPanel/ColorDisplayIcon'
}

export const Default: StoryObj<typeof ColorDisplayIcon> = {
  render: () => {
    return (
      <Box sx={{ display: 'flex' }}>
        <ColorDisplayIcon color={TypographyColor.secondary} />
      </Box>
    )
  }
}

export default ColorDisplayIconStory
