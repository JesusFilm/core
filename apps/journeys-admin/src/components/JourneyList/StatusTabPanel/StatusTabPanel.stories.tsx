import { Story, Meta } from '@storybook/react'

import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../journeyListData'
import { StatusTabPanelProps } from './StatusTabPanel'
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

const Template: Story<StatusTabPanelProps> = ({ ...args }) => (
  <MockedProvider>
    <StatusTabPanel {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journeys: [defaultJourney, publishedJourney, oldJourney, descriptiveJourney],
  disableCreation: true
}

export const Loading = Template.bind({})
Loading.args = {
  journeys: undefined,
  disableCreation: true
}

export default StatusTabPanelStory as Meta
