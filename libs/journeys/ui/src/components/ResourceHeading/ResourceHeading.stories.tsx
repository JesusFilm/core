import { simpleComponentConfig } from '@core/shared/ui/storybook'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { ResourceHeading } from './ResourceHeading'

const ResourceHeadingStory: Meta<typeof ResourceHeading> = {
  ...simpleComponentConfig,
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
