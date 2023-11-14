import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../../libs/storybook'
import {
  archivedJourney,
  defaultJourney,
  publishedJourney,
  trashedJourney
} from '../../data'

import { JourneyDetails } from './JourneyDetails'

const JourneyDetailsStory: Meta<typeof JourneyDetails> = {
  ...simpleComponentConfig,
  component: JourneyDetails,
  title: 'Journeys-Admin/Editor/Properties/JourneyDetails'
}

const Template: StoryObj<
  ComponentProps<typeof JourneyDetails> & { journey: Journey }
> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
        <JourneyDetails {...args} />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: defaultJourney
  }
}

export const Publish = {
  ...Template,
  args: {
    journey: publishedJourney
  }
}

export const Archived = {
  ...Template,
  args: {
    journey: archivedJourney
  }
}

export const Trashed = {
  ...Template,
  args: {
    journey: trashedJourney
  }
}

export const PreviousYear = {
  ...Template,
  args: {
    journey: {
      ...publishedJourney,
      createdAt: '2020-11-19T12:34:56.647Z'
    }
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}

export default JourneyDetailsStory
