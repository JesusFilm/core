import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ThemeMode } from '@core/shared/ui/themes'

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
