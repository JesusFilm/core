import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import JourneyShare, { ShareSectionProps } from './ShareSection'

const JourneyShareDemo = {
  ...journeysAdminConfig,
  component: JourneyShare,
  title: 'Journeys-Admin/SingleJourney/ShareSection'
}

const Template: Story<ShareSectionProps> = ({ ...args }) => (
  <JourneyShare {...args} />
)

export const Default = Template.bind({})
Default.args = {
  slug: 'journey-slug',
  forceMenu: true
}

export default JourneyShareDemo as Meta
