import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import Box from '@mui/system/Box'
import { VideoLabel } from '../../../../../__generated__/globalTypes'
import { watchConfig } from '../../../../libs/storybook'
import { VideoHeroOverlay } from './VideoHeroOverlay'

const VideoHeroOverlayStory = {
  ...watchConfig,
  component: VideoHeroOverlay,
  title: 'Watch/VideoContentPage/VideoHero/VideoHeroOverlay',
  parameters: {
    fullscreen: true
  }
}

const Template: Story<ComponentProps<typeof VideoHeroOverlay>> = ({
  ...args
}) => (
  <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 776
      }}
    >
      <VideoHeroOverlay {...args} />
    </Box>
  </ThemeProvider>
)

export const Default = Template.bind({})
Default.args = {
  video: {
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
}

export default VideoHeroOverlayStory as Meta
