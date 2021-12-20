import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import { ShareSection, ShareSectionProps } from './ShareSection'

const JourneyShareDemo = {
  ...journeysAdminConfig,
  component: ShareSection,
  title: 'Journeys-Admin/SingleJourney/ShareSection'
}

const Template: Story<ShareSectionProps> = ({ ...args }) => (
  <ShareSection {...args} />
)

export const Default = Template.bind({})
Default.args = {
  slug: 'journey-slug',
  forceMenu: true
}

export default JourneyShareDemo as Meta
