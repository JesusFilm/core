import { Meta, Story } from '@storybook/react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import Box from '@mui/system/Box'
import { VideoContentFields } from '../../../../../__generated__/VideoContentFields'
import { VideoLabel } from '../../../../../__generated__/globalTypes'
import { watchConfig } from '../../../../libs/storybook'
import { VideoProvider } from '../../../../libs/videoContext'
import { VideoHeroOverlay } from './VideoHeroOverlay'

const VideoHeroOverlayStory = {
  ...watchConfig,
  component: VideoHeroOverlay,
  title: 'Watch/VideoContentPage/VideoHero/VideoHeroOverlay',
  parameters: {
    fullscreen: true
  }
}

const video: VideoContentFields = {
  id: '1_cl-0-0',
  __typename: 'Video',
  label: VideoLabel.featureFilm,
  description: [],
  studyQuestions: [],
  snippet: [],
  children: [],
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
  imageAlt: [
    {
      __typename: 'Translation',
      value: 'The Story of Jesus for Children'
    }
  ],
  variant: {
    id: '1_529-cl-0-0',
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English'
        }
      ]
    },
    duration: 3680,
    __typename: 'VideoVariant',
    hls: 'https://arc.gt/zbrvj',
    slug: 'the-story-of-jesus-for-children/english'
  },
  title: [
    {
      value: 'The Story of Jesus for Children',
      __typename: 'Translation'
    }
  ],
  slug: 'the-story-of-jesus-for-children'
}

const Template: Story = () => (
  <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
    <VideoProvider value={{ content: video }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 776
        }}
      >
        <VideoHeroOverlay />
      </Box>
    </VideoProvider>
  </ThemeProvider>
)

export const Default = Template.bind({})

export default VideoHeroOverlayStory as Meta
