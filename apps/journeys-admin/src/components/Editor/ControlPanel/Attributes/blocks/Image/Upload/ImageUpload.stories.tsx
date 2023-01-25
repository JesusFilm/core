import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'

import { ImageUpload } from '.'

const ImageUploadStory = {
  ...journeysAdminConfig,
  component: ImageUpload,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Image/ImageUpload',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

export const Default: Story = () => (
  <Box sx={{ maxWidth: 280, maxHeight: 172 }}>
    <ImageUpload />
  </Box>
)

export default ImageUploadStory as Meta
