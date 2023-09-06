import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { watchConfig } from '../../libs/storybook'

import { Header } from './Header'

const HeaderStory: Meta<typeof Header> = {
  ...watchConfig,
  component: Header,
  title: 'Watch/Header',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof Header> = {
  render: () => (
    <Box
      sx={{
        backgroundColor: '#26262E'
      }}
    >
      <Header />
    </Box>
  )
}

export const Default = { ...Template }

export const OpenPanel = {
  ...Template,
  play: async () => {
    const menuButton = screen.getAllByTestId('MenuIcon')[0]
    await userEvent.click(menuButton)
  }
}

export default HeaderStory
