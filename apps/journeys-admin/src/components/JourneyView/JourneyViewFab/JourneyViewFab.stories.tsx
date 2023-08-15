import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { simpleComponentConfig } from '../../../libs/storybook'
import { TeamProvider } from '../../Team/TeamProvider'
import { defaultJourney } from '../data'

import { JourneyViewFab } from './JourneyViewFab'

const JourneyViewFabStory = {
  ...simpleComponentConfig,
  component: JourneyViewFab,
  title: 'Journeys-Admin/JourneyView/JourneyViewFab'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <TeamProvider>
      <SnackbarProvider>
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <JourneyViewFab isPublisher={args.isPublisher} />
        </JourneyProvider>
      </SnackbarProvider>
    </TeamProvider>
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
