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
import { ArchivedJourneyList } from '.'

const ArchivedJourneyListStory = {
  ...journeysAdminConfig,
  component: ArchivedJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/ArchivedJourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <ArchivedJourneyList {...args.props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  mocks: [
    {
      request: {
        query: GET_JOURNEYS,
        variables: {
          status: [JourneyStatus.archived]
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
          status: [JourneyStatus.archived]
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

export const UnarchiveAll = Template.bind({})
UnarchiveAll.args = {
  props: {
    event: 'restoreAllArchived'
  },
  mocks: []
}

export const TrashAll = Template.bind({})
TrashAll.args = {
  props: {
    event: 'trashAllArchived'
  },
  mocks: []
}

export default ArchivedJourneyListStory as Meta
