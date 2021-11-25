import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../../libs/storybook'
import JourneyCardMenu from './JourneyCardMenu'

const JoruneyCardMenuDemo = {
  ...journeysAdminConfig,
  component: JourneyCardMenu,
  title: 'Journeys-Admin/JourneyList/JourneyCard/JourneyCardMenu'
}

const Template: Story = ({ ...args }) => (
  <JourneyCardMenu status={args.status} slug={args.slug} />
)

export const DraftJoruneyCardMenu = Template.bind({})
DraftJoruneyCardMenu.args = {
  status: 'Draft',
  slug: 'draft-journey'
}
export const PublishedJoruneyCardMenu = Template.bind({})
PublishedJoruneyCardMenu.args = {
  status: 'Published',
  slug: 'published-journey'
}

export default JoruneyCardMenuDemo as Meta
