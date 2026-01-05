import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal/getLinkActionGoal'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GoalsList } from './GoalsList'

const GoalsListStory: Meta<typeof GoalsList> = {
  ...journeysAdminConfig,
  component: GoalsList,
  title: 'Journeys-Admin/Editor/Slider/Content/Goals/GoalsList'
}

type Story = StoryObj<ComponentProps<typeof GoalsList>>

const Template: Story = {
  render: (args) => <GoalsList {...args} />
}

export const Default = {
  ...Template,
  args: {
    goals: [
      {
        url: 'https://www.google.com/',
        count: 2,
        goalType: GoalType.Website
      },
      {
        url: 'https://www.biblegateway.com/versions/',
        count: 1,
        goalType: GoalType.Bible
      },
      {
        url: 'https://www.messenger.com/t/',
        count: 1,
        goalType: GoalType.Chat
      }
    ]
  }
}

export default GoalsListStory
