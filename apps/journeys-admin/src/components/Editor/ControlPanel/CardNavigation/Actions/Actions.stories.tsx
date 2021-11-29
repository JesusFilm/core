import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { Actions } from '.'

const ActionsStory = {
  ...journeysAdminConfig,
  component: Actions,
  title: 'Journeys-Admin/Editor/ControlPanel/CardNavigation/Actions'
}

const Template: Story = () => <Actions />

export const Default = Template.bind({})

export default ActionsStory as Meta
