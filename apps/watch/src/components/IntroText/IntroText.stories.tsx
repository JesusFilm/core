import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { IntroText } from './IntroText'

const HomeHeroStory = {
  ...watchConfig,
  component: IntroText,
  title: 'Watch/IntroText',
  parameters: {
    fullscreen: true
  }
}

const Template: Story = () => (
  <Box
    sx={{
      backgroundColor: '#26262E'
    }}
  >
    <IntroText />
  </Box>
)

export const Default = Template.bind({})

export default HomeHeroStory as Meta
