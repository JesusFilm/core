import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { watchConfig } from '@core/shared/ui/storybook'

import { ResourceHeading } from './ResourceHeading'

const ResourceHeadingStory: Meta<typeof ResourceHeading> = {
  ...watchConfig,
  component: ResourceHeading,
  title: 'Watch/ResourceHeading'
}

type Story = StoryObj<ComponentProps<typeof ResourceHeading>>

const Template: Story = {
  render: (args) => <ResourceHeading {...args} />
}

export const Default = {
  ...Template,
  args: {
    heading: 'Custom Text'
  }
}

export default ResourceHeadingStory
