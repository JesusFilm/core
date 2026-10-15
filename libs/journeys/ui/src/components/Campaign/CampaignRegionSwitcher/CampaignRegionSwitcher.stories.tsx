import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, landingTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignRegionSwitcher } from './CampaignRegionSwitcher'

const meta: Meta<typeof CampaignRegionSwitcher> = {
  ...campaignStoryConfig(),
  component: CampaignRegionSwitcher,
  title: 'Journeys-Ui/Campaign/CampaignRegionSwitcher'
}

type Story = StoryObj<ComponentProps<typeof CampaignRegionSwitcher>>

export const Default: Story = {
  args: {
    block: landingTree(
      'landingSwitcherId'
    ) as CampaignTreeOf<'CampaignRegionSwitcherBlock'>
  }
}

export default meta
