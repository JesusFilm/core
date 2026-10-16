import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaignStoryConfig, regionTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignRegionShare } from './CampaignRegionShare'

const meta: Meta<typeof CampaignRegionShare> = {
  ...campaignStoryConfig(CampaignPageKind.regionTemplate),
  component: CampaignRegionShare,
  title: 'Journeys-Ui/Campaign/CampaignRegionShare'
}

type Story = StoryObj<ComponentProps<typeof CampaignRegionShare>>

export const Default: Story = {
  args: {
    block: regionTree(
      'regionShareId'
    ) as CampaignTreeOf<'CampaignRegionShareBlock'>
  }
}

export default meta
