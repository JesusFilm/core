import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, landingTree } from '../campaignStories'
import { youTubeVideoBlock } from '../testData'
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

/** More cards than fit: the fourth is clipped at the right edge and the arrows scroll the row from `md` up. */
export const ManyCards: Story = {
  args: {
    block: {
      ...(landingTree(
        'carouselId'
      ) as CampaignTreeOf<'CampaignVideoCarouselBlock'>),
      children: Array.from({ length: 8 }, (_, index) => ({
        ...youTubeVideoBlock,
        id: `youTubeItemId${index}`,
        parentBlockId: 'carouselId',
        parentOrder: index,
        title: `Outreach around the world ${index + 1}`,
        children: [],
        cover: null,
        media: null,
        logo: null
      }))
    }
  }
}

export default meta
