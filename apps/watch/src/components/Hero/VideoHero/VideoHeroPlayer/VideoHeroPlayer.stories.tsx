import { Meta, Story } from '@storybook/react'
import { ComponentProps, useRef } from 'react'
import Box from '@mui/material/Box'
import { noop } from 'lodash'
import { VideoLabel } from '../../../../../__generated__/globalTypes'
import { watchConfig } from '../../../../libs/storybook'
import { VideoHeroPlayer } from './VideoHeroPlayer'

import '../../../../../public/styles/video-js.css'

const VideoHeroPlayerStory = {
  ...watchConfig,
  component: VideoHeroPlayer,
  title: 'Watch/Hero/VideoHero/VideoHeroPlayer'
}

const Template: Story<ComponentProps<typeof VideoHeroPlayer>> = ({
  ...args
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  return (
    <Box sx={{ height: '100vh' }}>
      <VideoHeroPlayer
        videoRef={videoRef}
        video={args.video}
        playVideo={args.playVideo}
        pauseVideo={args.pauseVideo}
      />
    </Box>
  )
}

export const Default = Template.bind({})
Default.args = {
  video: {
    id: '1_cl-0-0',
    label: VideoLabel.episode,
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
    snippet: [
      {
        value:
          "In the first century, a group of children meet together to talk about what they've seen and heard about Jesus. Some believe Jesus is the Son of God. But others think Jesus may just be tricking the people.",
        __typename: 'Translation'
      }
    ],
    title: [
      {
        value: 'The Story of Jesus for Children',
        __typename: 'Translation'
      }
    ],
    variant: {
      duration: 3680,
      __typename: 'VideoVariant',
      hls: 'https://arc.gt/4jz75'
    },
    __typename: 'Video',
    episodeIds: [],
    slug: [
      {
        value: 'the-story-of-jesus-for-children',
        __typename: 'Translation'
      }
    ],
    children: []
  },
  playVideo: noop,
  pauseVideo: noop
}

export default VideoHeroPlayerStory as Meta
