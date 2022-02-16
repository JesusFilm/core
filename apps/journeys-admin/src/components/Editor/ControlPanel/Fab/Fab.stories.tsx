import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Fab } from '.'

const FabStory = {
  ...journeysAdminConfig,
  component: Fab,
  title: 'Journeys-Admin/Editor/ControlPanel/Fab'
}

const Template: Story = () => {
  return <Fab visible />
}

export const Default = Template.bind({})

export default FabStory as Meta
