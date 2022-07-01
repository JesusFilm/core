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
import { GET_ARCHIVED_JOURNEYS } from './ArchivedStatusTab'
import { ArchivedStatusTab } from '.'

const ArchivedStatusTabStory = {
  ...journeysAdminConfig,
  component: ArchivedStatusTab,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/ArchivedStatusTab',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <ArchivedStatusTab {...args.props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: {
    onLoad: noop
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
    onLoad: noop
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
    onLoad: noop
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

export default ArchivedStatusTabStory as Meta
