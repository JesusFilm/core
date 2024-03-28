import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { GoalsBanner } from './GoalsBanner'


const GoalsBannerStory: Meta<typeof GoalsBanner> = {
  ...journeysAdminConfig,
  component: GoalsBanner,
  title: 'Journeys-Admin/Editor/Slider/Content/Goals/GoalsBanner'
}

type Story = StoryObj<ComponentProps<typeof GoalsBanner> & { journey: Journey }>

const Template: Story = {
  render: () => (
    <GoalsBanner/>
  )
}

export const Default = {
  ...Template
}


export default GoalsBannerStory
