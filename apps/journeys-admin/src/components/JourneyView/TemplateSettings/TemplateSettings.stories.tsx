import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { ApolloLoadingProvider } from '../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'

import { TemplateSettings } from './TemplateSettings'

const TemplateSettingsStory: Meta<typeof TemplateSettings> = {
  ...simpleComponentConfig,
  component: TemplateSettings,
  title: 'Journeys-Admin/JourneyView/TemplateSettings',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<
  ComponentProps<typeof TemplateSettings> & { journey: Journey }
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
            <TemplateSettings />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    </ApolloLoadingProvider>
  )
}

export const Default = {
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

export default TemplateSettingsStory
