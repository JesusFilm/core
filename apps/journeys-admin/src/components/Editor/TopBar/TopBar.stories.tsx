import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../../libs/storybook'
import { TopBar } from '.'

const TopBarStory = {
  ...journeyAdminConfig,
  component: TopBar,
  title: 'Journeys-Admin/Editor/TopBar'
}

const Template: Story = () => <TopBar />

export const Default = Template.bind({})

export default TopBarStory as Meta
