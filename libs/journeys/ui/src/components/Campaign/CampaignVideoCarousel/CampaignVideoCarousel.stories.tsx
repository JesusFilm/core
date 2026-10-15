import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, landingTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignVideoCarousel } from './CampaignVideoCarousel'

const meta: Meta<typeof CampaignVideoCarousel> = {
  ...campaignStoryConfig(),
  component: CampaignVideoCarousel,
  title: 'Journeys-Ui/Campaign/CampaignVideoCarousel'
}

type Story = StoryObj<ComponentProps<typeof CampaignVideoCarousel>>

export const Default: Story = {
  args: {
    block: landingTree(
      'carouselId'
    ) as CampaignTreeOf<'CampaignVideoCarouselBlock'>
  }
}

export default meta
