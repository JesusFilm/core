import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { Canvas } from '.'

const CanvasStory = {
  ...journeysAdminConfig,
  component: Canvas,
  title: 'Journeys-Admin/Editor/Canvas'
}

const Template: Story = () => <Canvas />

export const Default = Template.bind({})

export default CanvasStory as Meta
