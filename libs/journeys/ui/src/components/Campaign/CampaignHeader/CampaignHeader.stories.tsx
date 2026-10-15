import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignChromeTrees } from '../CampaignPage/campaignChromeTrees'
import { campaignStoryConfig } from '../campaignStories'
import { campaignPublic } from '../testData'

import { CampaignHeader } from './CampaignHeader'

const meta: Meta<typeof CampaignHeader> = {
  ...campaignStoryConfig(),
  component: CampaignHeader,
  title: 'Journeys-Ui/Campaign/CampaignHeader'
}

type Story = StoryObj<ComponentProps<typeof CampaignHeader>>

export const Default: Story = {
  args: { block: campaignChromeTrees(campaignPublic).header }
}

export default meta
