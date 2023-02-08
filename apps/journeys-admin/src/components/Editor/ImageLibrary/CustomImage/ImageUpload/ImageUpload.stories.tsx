import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../libs/storybook'

import { ImageUpload } from '.'

const ImageUploadStory = {
  ...journeysAdminConfig,
  component: ImageUpload,
  title: 'Journeys-Admin/Editor/ImageLibrary/CustomImage/ImageUpload',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

export const Default: Story = () => (
  <MockedProvider mocks={[]}>
    <Box sx={{ maxWidth: 280, maxHeight: 172 }}>
      <ImageUpload />
    </Box>
  </MockedProvider>
)

export default ImageUploadStory as Meta
