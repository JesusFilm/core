import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { SnackbarProvider } from 'notistack'
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
      <JourneyProvider value={{ journey: args.journey }}>
        <Language isPublisher={args.isPublisher} />
      </JourneyProvider>
    </SnackbarProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

const language = {
  __typename: 'Language',
  id: '529',
  name: [
    {
      value: 'Беларуская мова',
      primary: true,
      __typename: 'Translation'
    },
    {
      value: 'Belorussian',
      primary: false,
      __typename: 'Translation'
    }
  ]
}

export const NativeLanguage = Template.bind({})
NativeLanguage.args = {
  journey: {
    ...defaultJourney,
    language: language
  }
}

export const Publisher = Template.bind({})
Publisher.args = {
  journey: {
    ...defaultJourney,
    language: language,
    template: true
  },
  isPublisher: true
}

export const Loading = Template.bind({})
Loading.args = {
  journey: null
}

export default LanguageStory as Meta
