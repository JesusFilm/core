import { Story, Meta } from '@storybook/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { SnackbarProvider } from 'notistack'
import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'
import { JourneyViewFab } from './JourneyViewFab'

const JourneyViewFabStory = {
  ...simpleComponentConfig,
  component: JourneyViewFab,
  title: 'Journeys-Admin/JourneyView/JourneyViewFab'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <FlagsProvider>
      <SnackbarProvider>
        <JourneyProvider value={{ journey: args.journey }}>
          <JourneyViewFab isPublisher={args.isPublisher} />
        </JourneyProvider>
      </SnackbarProvider>
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export const UseTemplate = Template.bind({})
UseTemplate.args = {
  journey: {
    ...defaultJourney,
    template: true
  }
}

export const PublisherEdit = Template.bind({})
PublisherEdit.args = {
  journey: {
    ...defaultJourney,
    template: true
  },
  isPublisher: true
}

export const Loading = Template.bind({})
Loading.args = {
  journey: null
}

export default JourneyViewFabStory as Meta
