import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../../../libs/storybook'

import { ResourceSection } from './ResourceSection'
import { getResourceSectionHandlers } from './ResourceSection.handlers'

const ResourceSectionStory: Meta<typeof ResourceSection> = {
  ...watchConfig,
  component: ResourceSection,
  title: 'Watch/ResourcesView/ResourceSections/ResourceSection'
}

type Story = StoryObj<ComponentProps<typeof ResourceSection>>

const Template: Story = {
  render: (args) => (
    <InstantSearchTestWrapper>
      <ResourceSection {...args} />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  args: {
    handleItemSearch: noop,
    index: 0
  },
  parameters: {
    msw: {
      handlers: [getResourceSectionHandlers]
    }
  }
}

export default ResourceSectionStory
