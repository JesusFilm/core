import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { JourneyCardMenu, JourneyCardMenuProps } from './JourneyCardMenu'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

const JoruneyCardMenuDemo = {
  ...journeysAdminConfig,
  component: JourneyCardMenu,
  title: 'Journeys-Admin/JourneyList/JourneyCard/Menu'
}

const Template: Story<JourneyCardMenuProps> = ({ ...args }) => (
  <JourneyCardMenu {...args} />
)

export const Draft = Template.bind({})
Draft.args = {
  status: JourneyStatus.draft,
  slug: 'draft-journey',
  forceMenu: true
}
export const Published = Template.bind({})
Published.args = {
  status: JourneyStatus.published,
  slug: 'published-journey',
  forceMenu: true
}

export default JoruneyCardMenuDemo as Meta
