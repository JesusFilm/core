import { ComponentMeta, ComponentStory } from '@storybook/react'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'

import { HomePage } from '.'

const HomePageStory: ComponentMeta<typeof HomePage> = {
  ...watchConfig,
  component: HomePage,
  title: 'Watch/HomePage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: ComponentStory<typeof HomePage> = ({ ...args }) => (
  <HomePage {...args} />
)

export const Default = Template.bind({})
Default.args = {
  videos
}

export default HomePageStory
