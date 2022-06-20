import { Story, Meta } from '@storybook/react'

import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from '../../journeyListData'
import { ActiveStatusTabProps } from './ActiveStatusTab'
import { ActiveStatusTab } from '.'

const ActiveStatusTabStory = {
  ...journeysAdminConfig,
  component: ActiveStatusTab,
  title: 'Journeys-Admin/JourneyList/ActiveStatusTabPanel/ActiveStatusTab',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ActiveStatusTabProps> = ({ ...args }) => (
  <MockedProvider>
    <ActiveStatusTab {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
// Default.args = {
//   journeys: [defaultJourney, publishedJourney, oldJourney, descriptiveJourney],
//   disableCreation: true
// }

export const NoJourneys = Template.bind({})
// NoJourneys.args = {
//   journeys: [],
//   disableCreation: true
// }

export default ActiveStatusTabStory as Meta
