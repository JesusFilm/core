import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignChromeTrees } from '../CampaignPage/campaignChromeTrees'
import { campaignStoryConfig } from '../campaignStories'
import { campaignPublic } from '../testData'

import { CampaignFooter } from './CampaignFooter'

const meta: Meta<typeof CampaignFooter> = {
  ...campaignStoryConfig(),
  component: CampaignFooter,
  title: 'Journeys-Ui/Campaign/CampaignFooter'
}

type Story = StoryObj<ComponentProps<typeof CampaignFooter>>

export const Default: Story = {
  args: { block: campaignChromeTrees(campaignPublic).footer }
}

export default meta
