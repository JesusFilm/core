import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'

import { TypographyColor } from '../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../libs/storybook'

import { ColorDisplayIcon } from '.'

const ColorDisplayIconStory = {
  ...simpleComponentConfig,
  component: ColorDisplayIcon,
  title: 'Journeys-Admin/Editor/ControlPanel/ColorDisplayIcon'
}

export const Default: Story = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <ColorDisplayIcon color={TypographyColor.secondary} />
    </Box>
  )
}

export default ColorDisplayIconStory as Meta
