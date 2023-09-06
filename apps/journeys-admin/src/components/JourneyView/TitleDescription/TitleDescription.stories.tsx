import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { ApolloLoadingProvider } from '../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'

import { TitleDescription } from './TitleDescription'

const TitleDescriptionStory: Meta<typeof TitleDescription> = {
  ...simpleComponentConfig,
  component: TitleDescription,
  title: 'Journeys-Admin/JourneyView/TitleDescription',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<
  ComponentProps<typeof TitleDescription> & { journey: Journey }
> = {
  render: ({ ...args }) => (
    <ApolloLoadingProvider>
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: args.journey,
              variant: 'admin'
            }}
          >
            <TitleDescription isPublisher={args.isPublisher} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    </ApolloLoadingProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: defaultJourney
  }
}

export const TemplateTitleDescription = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      title: 'Template Heading',
      description: 'Template description',
      template: true
    },
    isPublisher: true
  }
}

export default TitleDescriptionStory
