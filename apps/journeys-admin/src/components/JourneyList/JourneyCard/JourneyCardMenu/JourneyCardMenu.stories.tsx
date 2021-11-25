import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import JourneyCardMenu from './JourneyCardMenu'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

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
  status: JourneyStatus.draft,
  slug: 'draft-journey'
}
export const PublishedJoruneyCardMenu = Template.bind({})
PublishedJoruneyCardMenu.args = {
  status: JourneyStatus.published,
  slug: 'published-journey'
}

export default JoruneyCardMenuDemo as Meta
