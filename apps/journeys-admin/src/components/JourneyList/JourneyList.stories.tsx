import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'
import JourneyList from './JourneyList'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney
} from './journeyListData'

const TestStory = {
  ...journeysAdminConfig,
  component: JourneyList,
  title: 'Journeys-Admin/JourneyList'
}

const Template: Story = ({ ...args }) => <JourneyList journeys={[]} {...args} />

export const DefaultJourneyList = Template.bind({})
DefaultJourneyList.args = {
  journeys: [defaultJourney, oldJourney, descriptiveJourney]
}

export default TestStory as Meta
