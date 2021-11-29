import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import JourneyShare from './ShareSection'

const JourneyShareDemo = {
  ...journeysAdminConfig,
  component: JourneyShare,
  title: 'Journeys-Admin/SingleJourney/JourneyShare'
}

const Template: Story = ({ ...args }) => <JourneyShare slug={args.slug} />

export const defaultStory = Template.bind({})
defaultStory.args = {
  slug: 'journey-slug'
}

export default JourneyShareDemo as Meta
