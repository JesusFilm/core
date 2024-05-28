import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '../../libs/storybook'

import { ResourcePageHeader } from './ResourcePageHeader'

const ResourcePageHeaderStory: Meta<typeof ResourcePageHeader> = {
  ...watchConfig,
  component: ResourcePageHeader,
  title: 'Watch/ResourcePageHeader',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof ResourcePageHeader> = {
  render: () => (
    <Box>
      <ResourcePageHeader />
    </Box>
  )
}

export const Default = { ...Template }

export default ResourcePageHeaderStory
