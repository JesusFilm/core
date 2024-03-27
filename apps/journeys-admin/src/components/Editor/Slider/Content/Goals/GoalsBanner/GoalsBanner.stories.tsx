import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { journey } from '../../../Settings/GoalDetails/data'


import { GoalsBanner } from './GoalsBanner'


const GoalsBannerStory: Meta<typeof GoalsBanner> = {
  ...journeysAdminConfig,
  component: GoalsBanner,
  title: 'Journeys-Admin/Editor/Slider/Content/GoalsBanner'
}

type Story = StoryObj<ComponentProps<typeof GoalsBanner> & { journey: Journey }>

const Template: Story = {
  render: (args) => (
    <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
      <GoalsBanner  />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {
      ...journey
    }
  }
}


export default GoalsBannerStory