import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CollectionButton } from '.'

const CollectionButtonStory: Meta<typeof CollectionButton> = {
  ...journeysAdminConfig,
  component: CollectionButton,
  title: 'Journeys-Admin/TemplateGallery/CollectionButton',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof CollectionButton>> = {
  render: ({ ...args }) => (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        p: 5,
        height: '100%'
      }}
    >
      <CollectionButton {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    item: { id: 'tagId', name: [{ value: 'NUA', primary: true }] }
  }
}

export const NoImage = {
  ...Template,
  args: {
    item: { id: 'tagId', name: [{ value: 'New Collection', primary: true }] }
  }
}

export const Loading = {
  ...Template,
  args: {
    item: undefined
  }
}

export default CollectionButtonStory
