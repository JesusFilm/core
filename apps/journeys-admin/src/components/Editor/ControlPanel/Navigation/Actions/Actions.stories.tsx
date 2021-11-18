import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../../../../libs/storybook'
import { Actions } from '.'

const ActionsStory = {
  ...journeyAdminConfig,
  component: Actions,
  title: 'JourneyAdmin/Editor/ControlPanel/Navigation/Actions'
}

const Template: Story = () => <Actions />

export const Default = Template.bind({})

export default ActionsStory as Meta
