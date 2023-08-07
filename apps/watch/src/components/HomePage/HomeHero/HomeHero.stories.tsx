import { Meta, Story } from '@storybook/react'

import { watchConfig } from '../../../libs/storybook'

import { HomeHero } from './HomeHero'

const HomeHeroStory = {
  ...watchConfig,
  component: HomeHero,
  title: 'Watch/HomePage/HomeHero',
  parameters: {
    fullscreen: true
  }
}

const Template: Story = () => <HomeHero />

export const Default = Template.bind({})

export default HomeHeroStory as Meta
