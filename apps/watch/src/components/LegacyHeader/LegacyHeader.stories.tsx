import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ThemeMode } from '@core/shared/ui/themes'

import { watchConfig } from '../../libs/storybook'

import { LegacyHeader } from './LegacyHeader'

const LegacyHeaderStory: Meta<typeof LegacyHeader> = {
  ...watchConfig,
  component: LegacyHeader,
  title: 'Watch/LegacyHeader',
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

const Template: StoryObj<typeof LegacyHeader> = {
  render: () => <LegacyHeader themeMode={ThemeMode.light} />
}

const WithFlagsTemplate: StoryObj<typeof LegacyHeader> = {
  render: () => (
    <FlagsProvider
      flags={{
        ...trueHeaderItemsFlags
      }}
    >
      <LegacyHeader themeMode={ThemeMode.light} />
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
  },
  args: {
    hideTopAppBar: false,
    hideBottomAppBar: false,
    hideSpacer: false
  }
}

export const OpenPanel = {
  ...WithFlagsTemplate,
  play: async () => {
    const menuButton = screen.getByTestId('MenuIcon')
    await userEvent.click(menuButton)
  },
  args: {
    hideTopAppBar: false,
    hideBottomAppBar: false,
    hideSpacer: false
  }
}

export default LegacyHeaderStory
