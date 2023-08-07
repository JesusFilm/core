import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  defaultJourney,
  descriptiveJourney,
  oldJourney,
  publishedJourney
} from '../journeyListData'

import { TrashedJourneyList } from '.'

const TrashedJourneyListStory = {
  ...journeysAdminConfig,
  component: TrashedJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/TrashedJourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <TrashedJourneyList {...args.props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  mocks: [
    {
      request: {
        query: GET_ADMIN_JOURNEYS,
        variables: {
          status: [JourneyStatus.trashed]
        }
      },
      result: {
        data: {
          journeys: [
            defaultJourney,
            oldJourney,
            descriptiveJourney,
            publishedJourney
          ]
        }
      }
    }
  ]
}

export const NoJourneys = Template.bind({})
NoJourneys.args = {
  mocks: [
    {
      request: {
        query: GET_ADMIN_JOURNEYS,
        variables: {
          status: [JourneyStatus.trashed]
        }
      },
      result: {
        data: {
          journeys: []
        }
      }
    }
  ]
}

export const Loading = Template.bind({})
Loading.args = {
  mocks: []
}

export const RestoreAll = Template.bind({})
RestoreAll.args = {
  props: {
    event: 'restoreAllTrashed'
  },
  mocks: []
}

export const DeleteAll = Template.bind({})
DeleteAll.args = {
  props: {
    event: 'deleteAllTrashed'
  },
  mocks: []
}

export default TrashedJourneyListStory as Meta
