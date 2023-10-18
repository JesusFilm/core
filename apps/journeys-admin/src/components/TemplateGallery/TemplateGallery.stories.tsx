import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../libs/storybook'

import { TemplateGalleryMock } from './data'

import { TemplateGallery } from '.'

const TemplateGalleryStory: Meta<typeof TemplateGallery> = {
  ...journeysAdminConfig,
  component: TemplateGallery,
  title: 'Journeys-Admin/TemplateGallery',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof TemplateGallery>> = {
  render: () => (
    <MockedProvider mocks={TemplateGalleryMock}>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 5,
          height: '100%'
        }}
      >
        <TemplateGallery />
      </Box>
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export default TemplateGalleryStory
