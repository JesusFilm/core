import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { TypographyColor } from '../../../../../../../../../__generated__/globalTypes'

import { ColorDisplayIcon } from '.'

const ColorDisplayIconStory: Meta<typeof ColorDisplayIcon> = {
  ...simpleComponentConfig,
  component: ColorDisplayIcon,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/ColorDisplayIcon'
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
