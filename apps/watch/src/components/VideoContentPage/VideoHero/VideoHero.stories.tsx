import { ComponentProps } from 'react'
import { Meta, Story } from '@storybook/react'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { watchConfig } from '../../../libs/storybook'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../../libs/videoContext'
import { VideoHero } from './VideoHero'

import '../../../../public/styles/video-js.css'

const VideoHeroStory = {
  ...watchConfig,
  component: VideoHero,
  title: 'Watch/VideoContentPage/VideoHero'
}

const Template: Story<
  ComponentProps<typeof VideoHero> & { video: VideoContentFields }
> = ({ ...args }) => (
  <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
    <VideoProvider value={{ content: args.video }}>
      <VideoHero />
    </VideoProvider>
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

export default VideoHeroStory as Meta
