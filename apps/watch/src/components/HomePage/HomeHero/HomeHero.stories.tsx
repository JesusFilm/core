import { Meta, StoryObj } from '@storybook/react'

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
  render: () => <HomeHero languageId="en" />
}

export const Default = { ...Template }

export default HomeHeroStory
