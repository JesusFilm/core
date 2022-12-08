import { Meta, Story } from '@storybook/react'
import { ComponentProps, useRef } from 'react'
import Box from '@mui/material/Box'
import { noop } from 'lodash'
import { VideoLabel } from '../../../../../__generated__/globalTypes'
import { watchConfig } from '../../../../libs/storybook'
import { VideoContentFields } from '../../../../../__generated__/VideoContentFields'
import '../../../../../public/styles/video-js.css'
import { VideoProvider } from '../../../../libs/videoContext'
import { VideoHeroPlayer } from './VideoHeroPlayer'

const VideoHeroPlayerStory = {
  ...watchConfig,
  component: VideoHeroPlayer,
  title: 'Watch/VideoContentPage/VideoHero/VideoHeroPlayer'
}

const Template: Story<
  ComponentProps<typeof VideoHeroPlayer> & { video: VideoContentFields }
> = ({ ...args }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  return (
    <VideoProvider value={{ content: args.video }}>
      <Box sx={{ height: '100vh' }}>
        <VideoHeroPlayer videoRef={videoRef} playVideo={args.playVideo} />
      </Box>
    </VideoProvider>
  )
}

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
  },
  playVideo: noop
}

export default VideoHeroPlayerStory as Meta
