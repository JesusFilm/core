import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../journeyListData'
import { GET_JOURNEYS } from '../../../libs/useJourneys/useJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
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
        query: GET_JOURNEYS,
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
        query: GET_JOURNEYS,
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
