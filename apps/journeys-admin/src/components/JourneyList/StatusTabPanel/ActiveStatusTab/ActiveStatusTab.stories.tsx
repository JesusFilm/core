import { Story, Meta } from '@storybook/react'

import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../../journeyListData'
import { StatusTabProps } from './StatusTab'
import { StatusTab } from '.'

const StatusTabStory = {
  ...journeysAdminConfig,
  component: StatusTab,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel/StatusTab',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<StatusTabProps> = ({ ...args }) => (
  <MockedProvider>
    <StatusTab {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journeys: [defaultJourney, publishedJourney, oldJourney, descriptiveJourney],
  disableCreation: true
}

export const NoJourneys = Template.bind({})
NoJourneys.args = {
  journeys: [],
  disableCreation: true
}

export default StatusTabStory as Meta
