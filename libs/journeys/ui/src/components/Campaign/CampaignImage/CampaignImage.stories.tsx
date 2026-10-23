import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, treeOf } from '../campaignStories'
import { imageSectionBlock } from '../testData'
import type { CampaignTreeOf } from '../types'

import { CampaignImage } from './CampaignImage'

const meta: Meta<typeof CampaignImage> = {
  ...campaignStoryConfig(),
  component: CampaignImage,
  title: 'Journeys-Ui/Campaign/CampaignImage'
}

type Story = StoryObj<ComponentProps<typeof CampaignImage>>

export const Default: Story = {
  args: {
    block: treeOf(
      [imageSectionBlock],
      imageSectionBlock.id
    ) as CampaignTreeOf<'CampaignImageBlock'>
  }
}

export default meta
