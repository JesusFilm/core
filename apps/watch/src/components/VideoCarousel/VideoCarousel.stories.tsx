import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { watchConfig } from '../../libs/storybook/config'
import { videos } from '../Videos/__generated__/testData'
import { getAlgoliaVideosHandlers } from '../VideosPage/VideosPage.handlers'

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
      <InstantSearchTestWrapper>
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
      </InstantSearchTestWrapper>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    videos
  },
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  }
}

export const WithMuxInsert = {
  ...Template,
  args: {
    videos,
    slides: [
      {
        source: 'mux' as const,
        id: 'welcome-start',
        overlay: {
          label: 'Today’s Pick',
          title: 'Morning Nature Background',
          collection: 'Daily Inspirations',
          description: 'A calm intro before your playlist.'
        },
        playbackId: 'J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI',
        playbackIndex: 0,
        urls: {
          hls: 'https://stream.mux.com/J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI.m3u8',
          poster:
            'https://image.mux.com/J3WBxqGgXxi01201FYmW0202ayeL7PGXfuuXR02nvjQCE7bI/thumbnail.jpg?time=1',
          mp4: {}
        }
      },
      ...videos.map((video) => ({
        source: 'video' as const,
        id: video.id,
        video
      }))
    ]
  },
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  }
}

export default VideoCarouselStory
