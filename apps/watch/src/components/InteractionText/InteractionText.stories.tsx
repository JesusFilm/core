import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../libs/storybook'
import { InteractionText } from './InteractionText'

const InteractionTextStory: Meta<typeof InteractionText> = {
  ...watchConfig,
  component: InteractionText,
  title: 'Watch/InteractionText'
}

type Story = StoryObj<ComponentProps<typeof InteractionText>>

const Template: Story = {
  render: (args) => <InteractionText {...args} />
}

export const Default = {
  ...Template,
  args: {
    startingText: 'Custom Text'
  }
}

export default InteractionTextStory
