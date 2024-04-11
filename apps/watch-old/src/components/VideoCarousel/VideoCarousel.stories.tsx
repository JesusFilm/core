import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { watchConfig } from '../../libs/storybook/config'
import { videos } from '../Videos/__generated__/testData'

import { VideoCarousel } from './VideoCarousel'

const VideoCarouselStory: Meta<typeof VideoCarousel> = {
  ...watchConfig,
  component: VideoCarousel,
  title: 'Watch/VideoCarousel',
  parameters: {
    layout: 'fullscreen',
    chromatic: { delay: 3000 }
  }
}

const Template: StoryObj<typeof VideoCarousel> = {
  render: (args) => {
    return (
      <ThemeProvider
        nested
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
      >
        <Stack spacing={2}>
          <Typography>Expanded Variant with Active Video</Typography>
          <Box sx={{ backgroundColor: 'background.default', py: 4 }}>
            <VideoCarousel {...args} activeVideoId={videos[0].id} />
          </Box>
          <Typography>Expanded Variant when Loading</Typography>
          <Box sx={{ backgroundColor: 'background.default', py: 4 }}>
            <VideoCarousel {...args} loading />
          </Box>
          <Typography>Contained Variant</Typography>
          <Box sx={{ backgroundColor: 'background.default', py: 4 }}>
            <VideoCarousel {...args} variant="contained" />
          </Box>
          <Typography>Contained Variant when Loading</Typography>
          <Box sx={{ backgroundColor: 'background.default', py: 4 }}>
            <VideoCarousel {...args} variant="contained" loading />
          </Box>
        </Stack>
      </ThemeProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    videos
  }
}

export default VideoCarouselStory
