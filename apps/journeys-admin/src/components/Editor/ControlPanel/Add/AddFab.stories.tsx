import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { AddFab } from '.'

const AddStory = {
  ...journeysAdminConfig,
  component: AddFab,
  title: 'Journeys-Admin/Editor/ControlPanel/AddFab'
}

const Template: Story = () => {
  return <AddFab visible />
}

export const Default = Template.bind({})

export default AddStory as Meta
