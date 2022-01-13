import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Add } from '.'

const AddButtonStory = {
  ...journeysAdminConfig,
  component: Add,
  title: 'Journeys-Admin/Editor/Add'
}

const Template: Story = () => {
  return <Add />
}

export const Default = Template.bind({})

export default AddButtonStory as Meta
