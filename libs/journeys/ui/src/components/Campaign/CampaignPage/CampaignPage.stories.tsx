import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaignStoryConfig } from '../campaignStories'
import { campaignPublic, eurRegion } from '../testData'

import { CampaignPage } from './CampaignPage'

const meta: Meta<typeof CampaignPage> = {
  ...campaignStoryConfig(),
  component: CampaignPage,
  title: 'Journeys-Ui/Campaign/CampaignPage'
}

type Story = StoryObj<ComponentProps<typeof CampaignPage>>

export const Landing: Story = {
  args: { campaign: campaignPublic, pageKind: CampaignPageKind.landing }
}

export const RegionPage: Story = {
  args: {
    campaign: campaignPublic,
    pageKind: CampaignPageKind.regionTemplate,
    region: eurRegion
  }
}

export default meta
