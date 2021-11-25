import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TopBar } from '.'

const TopBarStory = {
  ...journeysAdminConfig,
  component: TopBar,
  title: 'Journeys-Admin/Editor/TopBar'
}

const Template: Story = () => <TopBar />

export const Default = Template.bind({})

export default TopBarStory as Meta
