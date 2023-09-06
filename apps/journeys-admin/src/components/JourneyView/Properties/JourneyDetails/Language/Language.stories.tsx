import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { defaultJourney } from '../../../data'

import { Language } from './Language'

const LanguageStory: Meta<typeof Language> = {
  ...simpleComponentConfig,
  component: Language,
  title: 'Journeys-Admin/JourneyView/Properties/JourneyDetails/Language'
}

const Template: StoryObj<
  ComponentProps<typeof Language> & { journey: Journey }
> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <Language isPublisher={args.isPublisher} />
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: defaultJourney
  }
}

export const Publisher = {
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

export default LanguageStory
