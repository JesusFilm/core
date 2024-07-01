import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { watchConfig } from '../../libs/storybook'

import { ThemeMode } from '@core/shared/ui/themes'
import { Header } from './Header'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { parameters } from '.storybook/preview'

const HeaderStory: Meta<typeof Header> = {
  ...watchConfig,
  component: Header,
  title: 'Watch/Header',
  parameters: {
    layout: 'fullscreen'
  }
}

const trueHeaderItemsFlags = {
  strategies: true,
  journeys: true,
  calendar: true,
  products: true
}

const Template: StoryObj<typeof Header> = {
  render: () => <Header themeMode={ThemeMode.light} />
}

const WithFlagsTemplate: StoryObj<typeof Header> = {
  render: () => (
    <FlagsProvider flags={{ ...trueHeaderItemsFlags }}>
      <Header themeMode={ThemeMode.light} />
    </FlagsProvider>
  )
}

export const Default = {
  ...Template
}

export const WithAllButtons = {
  ...WithFlagsTemplate,
  parameters: {
    nextjs: {
      router: {
        pathname: '/watch'
      }
    }
  }
}

export const OpenPanel = {
  ...Template,
  play: async () => {
    const menuButton = screen.getAllByTestId('MenuIcon')[0]
    await userEvent.click(menuButton)
  }
}

export default HeaderStory
