import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { TypographyAlign } from '../../../../__generated__/globalTypes'
import { campaignStoryConfig } from '../campaignStories'

import { CampaignSectionHeading } from './CampaignSectionHeading'

const meta: Meta<typeof CampaignSectionHeading> = {
  ...campaignStoryConfig(),
  component: CampaignSectionHeading,
  title: 'Journeys-Ui/Campaign/CampaignSectionHeading'
}

type Story = StoryObj<ComponentProps<typeof CampaignSectionHeading>>

const text = {
  eyebrow: 'Why it matters',
  title: 'A story for every home',
  description: 'Short films in the languages your neighbours speak.'
}

export const Default: Story = { args: text }

export const Centered: Story = {
  args: { ...text, align: TypographyAlign.center }
}

export const LineBreaks: Story = {
  args: {
    eyebrow: 'Why\nit matters',
    title: 'A story\nfor every home',
    description: 'Short films in the languages\nyour neighbours speak.'
  }
}

export default meta
