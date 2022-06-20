import { Story, Meta } from '@storybook/react'

import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../journeyListData'
import { GET_ACTIVE_JOURNEYS } from './ActiveStatusTab/ActiveStatusTab'
import { StatusTabPanel } from '.'

const StatusTabPanelStory = {
  ...journeysAdminConfig,
  component: StatusTabPanel,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <StatusTabPanel />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
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

export const Loading = Template.bind({})
Loading.args = {
  mocks: []
}

export default StatusTabPanelStory as Meta
