import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, landingTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignJourneyList } from './CampaignJourneyList'

const meta: Meta<typeof CampaignJourneyList> = {
  ...campaignStoryConfig(),
  component: CampaignJourneyList,
  title: 'Journeys-Ui/Campaign/CampaignJourneyList'
}

type Story = StoryObj<ComponentProps<typeof CampaignJourneyList>>

export const Default: Story = {
  args: {
    block: landingTree(
      'landingJourneyListId'
    ) as CampaignTreeOf<'CampaignJourneyListBlock'>
  }
}

export default meta
