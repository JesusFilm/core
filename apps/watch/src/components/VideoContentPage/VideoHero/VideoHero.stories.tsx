import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { VideoHero } from './VideoHero'

const VideoHeroStory = {
  ...watchConfig,
  component: VideoHero,
  title: 'Watch/VideoContentPage/VideoHero',
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
      <VideoHero />
    </VideoProvider>
  </ThemeProvider>
)

export const Default = Template.bind({})

export const VideoPlayer = Template.bind({})
VideoPlayer.play = async () => {
  const PlayVideo = screen.getByRole('button', { name: 'Play' })
  userEvent.click(PlayVideo)
}

export default VideoHeroStory as Meta
