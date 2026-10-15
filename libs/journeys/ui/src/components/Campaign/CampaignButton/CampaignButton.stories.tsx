import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { campaignStoryConfig, landingTree } from '../campaignStories'
import type { CampaignTreeOf } from '../types'

import { CampaignButton } from './CampaignButton'

const meta: Meta<typeof CampaignButton> = {
  ...campaignStoryConfig(),
  component: CampaignButton,
  title: 'Journeys-Ui/Campaign/CampaignButton'
}

type Story = StoryObj<ComponentProps<typeof CampaignButton>>

const button = landingTree('heroId')
  .children[0] as CampaignTreeOf<'CampaignButtonBlock'>

export const Default: Story = { args: { block: button } }

/** An action whose target is missing renders static, never hidden. */
export const Inert: Story = {
  args: { block: { ...button, action: null } }
}

export default meta
