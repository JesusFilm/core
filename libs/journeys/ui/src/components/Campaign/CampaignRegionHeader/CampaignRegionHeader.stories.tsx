import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { campaignStoryConfig, regionTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignRegionHeader } from './CampaignRegionHeader'

const meta: Meta<typeof CampaignRegionHeader> = {
  ...campaignStoryConfig(CampaignPageKind.regionTemplate),
  component: CampaignRegionHeader,
  title: 'Journeys-Ui/Campaign/CampaignRegionHeader'
}

type Story = StoryObj<ComponentProps<typeof CampaignRegionHeader>>

export const Default: Story = {
  args: {
    block: regionTree(
      'regionHeaderId'
    ) as CampaignTreeOf<'CampaignRegionHeaderBlock'>
  }
}

export default meta
