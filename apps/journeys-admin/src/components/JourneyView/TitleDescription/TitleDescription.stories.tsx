import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  JourneyProvider,
  RenderLocation
} from '@core/journeys/ui/JourneyProvider'
import { SnackbarProvider } from 'notistack'
import { ApolloLoadingProvider } from '../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'
import { TitleDescription } from './TitleDescription'

const TitleDescriptionStory = {
  ...simpleComponentConfig,
  component: TitleDescription,
  title: 'Journeys-Admin/JourneyView/TitleDescription',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <ApolloLoadingProvider>
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: args.journey,
            renderLocation: RenderLocation.Admin
          }}
        >
          <TitleDescription isPublisher={args.isPublisher} />
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  </ApolloLoadingProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export const TemplateTitleDescription = Template.bind({})
TemplateTitleDescription.args = {
  journey: {
    ...defaultJourney,
    title: 'Template Heading',
    description: 'Template description',
    template: true
  },
  isPublisher: true
}

export default TitleDescriptionStory as Meta
