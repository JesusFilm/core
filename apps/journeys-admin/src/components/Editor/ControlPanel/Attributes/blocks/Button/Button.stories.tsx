import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { Button } from '.'

const ButtonStory = {
  ...journeysAdminConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Attribute'
}

export const Default: Story = () => {
  return <Button />
}

export default ButtonStory as Meta
