import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { AIGallery } from '.'

const AIGalleryStory: Meta<typeof AIGallery> = {
  ...simpleComponentConfig,
  component: AIGallery,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageBlockEditor/AIGallery'
}

const Template: StoryObj<typeof AIGallery> = {
  render: () => (
    <MockedProvider mocks={[]}>
      <Box sx={{ bgcolor: 'background.paper' }}>
        <AIGallery onChange={noop} />
      </Box>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default AIGalleryStory
