import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { watchConfig } from '../../../../libs/storybook'

import { VideoCarouselNavButton } from './VideoCarouselNavButton'

const VideoCarouselNavButtonStory: Meta<typeof VideoCarouselNavButton> = {
  ...watchConfig,
  component: VideoCarouselNavButton,
  title: 'Watch/VideoCarousel/VideoCarouselNavButton',
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const Template: StoryObj<typeof VideoCarouselNavButton> = {
  render: () => {
    return (
      <ThemeProvider
        nested
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
      >
        <Box sx={{ position: 'relative', height: 200 }}>
          <VideoCarouselNavButton variant="prev" />
          <VideoCarouselNavButton variant="next" />
        </Box>
      </ThemeProvider>
    )
  }
}

export const Default = { ...Template }

export default VideoCarouselNavButtonStory
