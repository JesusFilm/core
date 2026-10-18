import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, landingTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignHero } from './CampaignHero'

const meta: Meta<typeof CampaignHero> = {
  ...campaignStoryConfig(),
  component: CampaignHero,
  title: 'Journeys-Ui/Campaign/CampaignHero'
}

type Story = StoryObj<ComponentProps<typeof CampaignHero>>

export const Default: Story = {
  args: {
    block: landingTree('heroId') as CampaignTreeOf<'CampaignHeroBlock'>
  }
}

export default meta
