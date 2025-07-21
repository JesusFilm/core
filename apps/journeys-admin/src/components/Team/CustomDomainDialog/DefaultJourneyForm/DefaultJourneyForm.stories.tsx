import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'

import { DefaultJourneyForm } from '.'

const DefaultJourneyFormStory: Meta<typeof DefaultJourneyForm> = {
  ...journeysAdminConfig,
  component: DefaultJourneyForm,
  title:
    'Journeys-Admin/Team/CustomDomain/CustomDomainDialog/DefaultJourneyForm'
}

const customDomain: CustomDomain = {
  __typename: 'CustomDomain',
  name: 'example.com',
  apexName: 'example.com',
  id: 'customDomainId',
  journeyCollection: {
    __typename: 'JourneyCollection',
    id: 'journeyCollectionId',
    journeys: [
      {
        __typename: 'Journey',
        id: 'journey-id-1',
        title: 'Default Journey Heading One'
      },
      {
        __typename: 'Journey',
        id: 'journey-id-2',
        title: 'Default Journey Heading Two'
      }
    ]
  }
}

const Template: StoryObj<typeof DefaultJourneyForm> = {
  render: (args) => <DefaultJourneyForm {...args} />
}

export const Default = {
  ...Template,
  args: {
    customDomain
  }
}

export default DefaultJourneyFormStory
