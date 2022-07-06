import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import noop from 'lodash/noop'
import { journeysAdminConfig } from '../../../../libs/storybook'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../../journeyListData'
import { GET_TRASHED_JOURNEYS } from './TrashedStatusTab'
import { TrashedStatusTab } from '.'

const TrashedStatusTabStory = {
  ...journeysAdminConfig,
  component: TrashedStatusTab,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/TrashedStatusTab',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <TrashedStatusTab {...args.props} />
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
        query: GET_TRASHED_JOURNEYS
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
        query: GET_TRASHED_JOURNEYS
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

export const RestoreAll = Template.bind({})
RestoreAll.args = {
  props: {
    onLoad: noop,
    event: 'restoreAllTrashed'
  },
  mocks: []
}

export const DeleteAll = Template.bind({})
DeleteAll.args = {
  props: {
    onLoad: noop,
    event: 'deleteAllTrashed'
  },
  mocks: []
}

export default TrashedStatusTabStory as Meta
