import { Meta, StoryObj } from '@storybook/nextjs'

import { watchConfig } from '../../../libs/storybook'

import { HomeHero } from './HomeHero'

const HomeHeroStory: Meta<typeof HomeHero> = {
  ...watchConfig,
  component: HomeHero,
  title: 'Watch/HomePage/HomeHero',
  parameters: {
    fullscreen: true
  }
}

const Template: StoryObj<typeof HomeHero> = {
  render: () => <HomeHero />
}

export const Default = { ...Template }

export default HomeHeroStory
