import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { simpleComponentConfig } from '../../../../../libs/storybook'
import { defaultJourney } from '../../../data'

import { Language } from './Language'

const LanguageStory = {
  ...simpleComponentConfig,
  component: Language,
  title: 'Journeys-Admin/JourneyView/Properties/JourneyDetails/Language'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <SnackbarProvider>
      <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
        <Language isPublisher={args.isPublisher} />
      </JourneyProvider>
    </SnackbarProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export const Publisher = Template.bind({})
Publisher.args = {
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

export default LanguageStory as Meta
