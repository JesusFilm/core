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
import { GET_ACTIVE_JOURNEYS } from '../../../libs/useActiveJourneys/useActiveJourneys'
import { ActiveJourneyList } from '.'

const ActiveJourneyListStory = {
  ...journeysAdminConfig,
  component: ActiveJourneyList,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/ActiveJourneyList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <ActiveJourneyList {...args.props} />
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
        query: GET_ACTIVE_JOURNEYS
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
        query: GET_ACTIVE_JOURNEYS
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

export const ArchiveAll = Template.bind({})
ArchiveAll.args = {
  props: {
    onLoad: noop,
    event: 'archiveAllActive'
  },
  mocks: []
}

export const TrashAll = Template.bind({})
TrashAll.args = {
  props: {
    onLoad: noop,
    event: 'trashAllActive'
  },
  mocks: []
}

export default ActiveJourneyListStory as Meta
