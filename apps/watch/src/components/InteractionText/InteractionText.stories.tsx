import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../libs/storybook'
import { InteractionText } from './InteractionText'

const InteractionTextStory: Meta<typeof InteractionText> = {
  ...watchConfig,
  component: InteractionText,
  title: 'Watch/InteractionText'
}

type Story = StoryObj<
  ComponentProps<typeof InteractionText> & { startingText: string }
>

const Template: Story = {
  render: (args) => <InteractionText {...args} />
}

export const Strategies = {
  ...Template,
  args: {
    startingText: 'Resources'
  }
}

export const Journeys = {
  ...Template,
  args: {
    startingText: 'Next Step'
  }
}

export const Videos = {
  ...Template,
  args: {
    startingText: 'Gospel Video'
  }
}

export default InteractionTextStory
