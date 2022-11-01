import { Meta, Story } from '@storybook/react'
import Box from '@mui/material/Box'
import { watchConfig } from '../../libs/storybook'
import { Header } from './Header'

const HeaderStory = {
  ...watchConfig,
  component: Header,
  title: 'Watch/Header',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = () => (
  <Box
    sx={{
      backgroundColor: '#26262E'
    }}
  >
    <Header />
  </Box>
)

export const Default = Template.bind({})

export default HeaderStory as Meta
