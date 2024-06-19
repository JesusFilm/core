import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'

import { WatchHomePage } from '.'

const WatchHomePageStory: Meta<typeof WatchHomePage> = {
  ...watchConfig,
  component: WatchHomePage,
  title: 'Watch/WatchHomePage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof WatchHomePage> = {
  render: ({ ...args }) => <WatchHomePage {...args} />
}

export const Default = { ...Template, args: { videos } }

export default WatchHomePageStory
