import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, landingTree } from '../campaignStories'
import { campaignPublic, campaignStatsFixture } from '../testData'
import type { CampaignTreeOf } from '../types'

import { CampaignAnalytics } from './CampaignAnalytics'
import { GET_CAMPAIGN_STATS } from './getCampaignStats'

const statsMock = {
  request: { query: GET_CAMPAIGN_STATS, variables: { id: campaignPublic.id } },
  result: { data: { campaignStats: campaignStatsFixture } }
}

const meta: Meta<typeof CampaignAnalytics> = {
  ...campaignStoryConfig(undefined, [statsMock]),
  component: CampaignAnalytics,
  title: 'Journeys-Ui/Campaign/CampaignAnalytics'
}

type Story = StoryObj<ComponentProps<typeof CampaignAnalytics>>

export const Default: Story = {
  args: {
    block: landingTree(
      'landingAnalyticsId'
    ) as CampaignTreeOf<'CampaignAnalyticsBlock'>
  }
}

export default meta
