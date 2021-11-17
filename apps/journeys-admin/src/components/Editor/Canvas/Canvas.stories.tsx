import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../../libs/storybook'
import { Canvas } from '.'

const CanvasStory = {
  ...journeyAdminConfig,
  component: Canvas,
  title: 'JourneyAdmin/Editor/Canvas'
}

const Template: Story = () => <Canvas />

export const Default = Template.bind({})

export default CanvasStory as Meta
