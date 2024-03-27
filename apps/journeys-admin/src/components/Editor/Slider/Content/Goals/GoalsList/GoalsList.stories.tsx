import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal/getLinkActionGoal'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { journey } from '../../../Settings/GoalDetails/data'

import { GoalsList } from './GoalsList'


const GoalsListStory: Meta<typeof GoalsList> = {
  ...journeysAdminConfig,
  component: GoalsList,
  title: 'Journeys-Admin/Editor/Slider/Content/GoalsList'
}

type Story = StoryObj<ComponentProps<typeof GoalsList> & { journey: Journey }>

const Template: Story = {
  render: (args) => (
    <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
      <GoalsList goals={args.goals} />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {
      ...journey
    },
    goals : [
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

export const Empty = {
  ...Template, goals: [] ,
  args: {
    journey: {
      ...journey,
    },
  }
}

export default GoalsListStory