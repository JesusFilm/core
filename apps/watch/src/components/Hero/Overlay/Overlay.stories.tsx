import { ComponentStory, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { watchConfig } from '../../../libs/storybook'
import { Overlay } from '.'

const OverlayStory = {
  ...watchConfig,
  component: Overlay,
  title: 'Watch/Hero/Overlay'
}

const Template: ComponentStory<typeof Overlay> = () => (
  <Box
    sx={{
      height: '300px',
      width: '300px',
      position: 'relative'
    }}
  >
    <Overlay />
  </Box>
)

export const Default = Template.bind({})

export default OverlayStory as Meta
