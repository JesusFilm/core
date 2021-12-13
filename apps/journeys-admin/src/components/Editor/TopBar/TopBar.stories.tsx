import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TopBar } from '.'

const TopBarStory = {
  ...journeysAdminConfig,
  component: TopBar,
  title: 'Journeys-Admin/Editor/TopBar'
}

const Template: Story = () => (
  <TopBar
    title="NUA Journey: Ep.3 - Decision"
    slug="nua-journey-ep-3-decision"
  />
)

export const Default = Template.bind({})

export default TopBarStory as Meta
