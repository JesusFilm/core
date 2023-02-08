import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { CustomImage } from '.'

const CustomImageStory = {
  ...journeysAdminConfig,
  component: CustomImage,
  title: 'Journeys-Admin/Editor/ImageLibrary/CustomImage',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

export const Default: Story = () => (
  <MockedProvider mocks={[]}>
    <Box sx={{ maxWidth: 280, maxHeight: 172 }}>
      <CustomImage />
    </Box>
  </MockedProvider>
)

export default CustomImageStory as Meta
