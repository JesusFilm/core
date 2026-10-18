import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { CampaignSwitcherVariant } from '../../../../__generated__/globalTypes'
import { campaignStoryConfig, landingTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignRegionSwitcher } from './CampaignRegionSwitcher'

const meta: Meta<typeof CampaignRegionSwitcher> = {
  ...campaignStoryConfig(),
  component: CampaignRegionSwitcher,
  title: 'Journeys-Ui/Campaign/CampaignRegionSwitcher'
}

type Story = StoryObj<ComponentProps<typeof CampaignRegionSwitcher>>

const switcher = landingTree(
  'landingSwitcherId'
) as CampaignTreeOf<'CampaignRegionSwitcherBlock'>

export const Default: Story = {
  args: { block: switcher }
}

/** Cards auto-fill at 230 px from `md`, one column below it. */
export const Cards: Story = {
  args: {
    block: { ...switcher, switcherVariant: CampaignSwitcherVariant.cards }
  }
}

/** One full-width row per region; the region code keeps its width. */
export const List: Story = {
  args: {
    block: { ...switcher, switcherVariant: CampaignSwitcherVariant.list }
  }
}

/** Pills wrap at every width and carry the name and flags only. */
export const Pills: Story = {
  args: {
    block: { ...switcher, switcherVariant: CampaignSwitcherVariant.pills }
  }
}

export default meta
