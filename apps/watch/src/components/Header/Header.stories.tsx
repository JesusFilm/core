import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

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

export const OpenPanel = Template.bind({})
OpenPanel.play = () => {
  const menuButton = screen.getAllByTestId('MenuIcon')[0]
  userEvent.click(menuButton)
}

export default HeaderStory as Meta
