import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { FeltNeedsButton } from '.'

const FeltNeedsButtonStory: Meta<typeof FeltNeedsButton> = {
  ...journeysAdminConfig,
  component: FeltNeedsButton,
  title: 'Journeys-Admin/TemplateGallery/FeltNeedsButton',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof FeltNeedsButton>> = {
  render: ({ ...args }) => (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        p: 5,
        height: '100%'
      }}
    >
      <FeltNeedsButton {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    item: { id: 'tagId', name: [{ value: 'Acceptance', primary: true }] }
  }
}

export const Loading = {
  ...Template,
  args: {
    item: undefined
  }
}

export default FeltNeedsButtonStory
