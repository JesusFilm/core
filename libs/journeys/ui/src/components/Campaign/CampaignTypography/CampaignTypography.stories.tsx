import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, landingTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignTypography } from './CampaignTypography'

const meta: Meta<typeof CampaignTypography> = {
  ...campaignStoryConfig(),
  component: CampaignTypography,
  title: 'Journeys-Ui/Campaign/CampaignTypography'
}

type Story = StoryObj<ComponentProps<typeof CampaignTypography>>

export const Default: Story = {
  args: {
    block: landingTree('landingJourneyListId')
      .children[0] as CampaignTreeOf<'CampaignTypographyBlock'>
  }
}

export default meta
