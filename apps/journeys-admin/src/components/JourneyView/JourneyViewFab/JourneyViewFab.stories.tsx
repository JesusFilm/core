import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../libs/storybook'
import { TeamProvider } from '../../Team/TeamProvider'
import { defaultJourney } from '../data'

import { JourneyViewFab } from './JourneyViewFab'

const JourneyViewFabStory: Meta<typeof JourneyViewFab> = {
  ...simpleComponentConfig,
  component: JourneyViewFab,
  title: 'Journeys-Admin/JourneyView/JourneyViewFab'
}

const Template: StoryObj<
  ComponentProps<typeof JourneyViewFab> & { journey: Journey }
> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <TeamProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
            <JourneyViewFab isPublisher={args.isPublisher} />
          </JourneyProvider>
        </SnackbarProvider>
      </TeamProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: defaultJourney
  }
}

export const UseTemplate = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      template: true
    }
  }
}

export const PublisherEdit = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      template: true
    },
    isPublisher: true
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: null
  }
}

export default JourneyViewFabStory
