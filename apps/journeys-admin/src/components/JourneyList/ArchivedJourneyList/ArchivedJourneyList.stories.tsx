import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import noop from 'lodash/noop'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../journeyListData'
import { GET_ARCHIVED_JOURNEYS } from './ArchivedJourneyList'
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
  props: {
    onLoad: noop,
    event: ''
  },
  mocks: [
    {
      request: {
        query: GET_ARCHIVED_JOURNEYS
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
  props: {
    onLoad: noop,
    event: ''
  },
  mocks: [
    {
      request: {
        query: GET_ARCHIVED_JOURNEYS
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
  props: {
    onLoad: noop,
    event: ''
  },
  mocks: []
}

export const UnarchiveAll = Template.bind({})
UnarchiveAll.args = {
  props: {
    onLoad: noop,
    event: 'restoreAllArchived'
  },
  mocks: []
}

export const TrashAll = Template.bind({})
TrashAll.args = {
  props: {
    onLoad: noop,
    event: 'trashAllArchived'
  },
  mocks: []
}

export default ArchivedJourneyListStory as Meta
