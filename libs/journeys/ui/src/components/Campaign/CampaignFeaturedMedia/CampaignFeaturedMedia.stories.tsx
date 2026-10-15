import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, treeOf } from '../campaignStories'
import { featuredMediaImageBlock, featuredMediaSectionBlock } from '../testData'
import type { CampaignTreeOf } from '../types'

import { CampaignFeaturedMedia } from './CampaignFeaturedMedia'

const meta: Meta<typeof CampaignFeaturedMedia> = {
  ...campaignStoryConfig(),
  component: CampaignFeaturedMedia,
  title: 'Journeys-Ui/Campaign/CampaignFeaturedMedia'
}

type Story = StoryObj<ComponentProps<typeof CampaignFeaturedMedia>>

export const Default: Story = {
  args: {
    block: treeOf(
      [featuredMediaSectionBlock, featuredMediaImageBlock],
      featuredMediaSectionBlock.id
    ) as CampaignTreeOf<'CampaignFeaturedMediaBlock'>
  }
}

export default meta
