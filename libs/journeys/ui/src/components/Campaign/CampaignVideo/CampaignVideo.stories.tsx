import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, treeOf } from '../campaignStories'
import { heroVideoBlock, watchParentVideoBlock } from '../testData'
import type { CampaignTreeOf } from '../types'

import { CampaignVideo } from './CampaignVideo'

const meta: Meta<typeof CampaignVideo> = {
  ...campaignStoryConfig(),
  component: CampaignVideo,
  title: 'Journeys-Ui/Campaign/CampaignVideo'
}

type Story = StoryObj<ComponentProps<typeof CampaignVideo>>

function videoTree(
  block: typeof heroVideoBlock
): CampaignTreeOf<'CampaignVideoBlock'> {
  return treeOf(
    [{ ...block, parentBlockId: null }],
    block.id
  ) as CampaignTreeOf<'CampaignVideoBlock'>
}

/** A Watch video with no children plays inline. */
export const Inline: Story = { args: { block: videoTree(heroVideoBlock) } }

/** A Watch video with children is a poster card linking out to Watch. */
export const WatchCard: Story = {
  args: { block: videoTree(watchParentVideoBlock) }
}

export default meta
