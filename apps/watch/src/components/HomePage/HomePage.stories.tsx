import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'

import { HomePage } from '.'

const HomePageStory: Meta<typeof HomePage> = {
  ...watchConfig,
  component: HomePage,
  title: 'Watch/HomePage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof HomePage> = {
  render: ({ ...args }) => <HomePage {...args} />
}

export const Default = { ...Template, args: { videos } }

export default HomePageStory
