import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'

import { GoalsBanner } from './GoalsBanner'

const GoalsBannerStory: Meta<typeof GoalsBanner> = {
  ...journeysAdminConfig,
  component: GoalsBanner,
  title: 'Journeys-Admin/Editor/Slider/Content/Goals/GoalsBanner'
}

type Story = StoryObj<ComponentProps<typeof GoalsBanner> & { journey: Journey }>

const Template: Story = {
  render: () => <GoalsBanner />
}

export const Default = {
  ...Template
}

export default GoalsBannerStory
