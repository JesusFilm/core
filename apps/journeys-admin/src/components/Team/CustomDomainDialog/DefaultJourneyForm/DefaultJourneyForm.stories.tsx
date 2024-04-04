import { Meta, StoryObj } from '@storybook/react'

import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { DefaultJourneyForm } from './DefaultJourneyForm'

const DefaultJourneyFormStory: Meta<typeof DefaultJourneyForm> = {
  ...journeysAdminConfig,
  component: DefaultJourneyForm,
  title:
    'Journeys-Admin/Team/CustomDomain/CustomDomainDialog/DefaultJourneyForm'
}

const customDomainWithJourneyCollection: CustomDomain = {
  id: 'customDomainId',
  __typename: 'CustomDomain' as const,
  name: 'mockdomain.com',
  apexName: 'mockdomain.com',
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
    customDomain: customDomainWithJourneyCollection
  }
}

export default DefaultJourneyFormStory
