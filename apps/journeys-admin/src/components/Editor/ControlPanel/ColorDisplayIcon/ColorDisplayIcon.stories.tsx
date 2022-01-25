import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { TypographyColor } from '../../../../../__generated__/globalTypes'
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
