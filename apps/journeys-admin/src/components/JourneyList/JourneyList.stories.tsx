import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'
import { JourneyList, JourneysListProps } from './JourneyList'
import {
  defaultJourney,
  oldJourney,
  descriptiveJourney,
  publishedJourney
} from './journeyListData'

const JourneyListStory = {
  ...journeysAdminConfig,
  component: JourneyList,
  title: 'Journeys-Admin/JourneyList',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story<JourneysListProps> = ({ ...args }) => (
  <JourneyList {...args} />
)

const Default = Template.bind({})
Default.args = {
  journeys: [defaultJourney, publishedJourney, oldJourney, descriptiveJourney]
}

const Empty = Template.bind({})
Empty.args = {
  journeys: []
}

export default JourneyListStory as Meta
export { Default, Empty }
