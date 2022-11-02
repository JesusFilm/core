import { Story, Meta } from '@storybook/react'
import { VideoType } from '../../../../__generated__/globalTypes'
import { watchConfig } from '../../../libs/storybook'
import { VideoThumbnail } from './VideoThumbnail'

const VideoThumbnailStory = {
  ...watchConfig,
  component: VideoThumbnail,
  title: 'Watch/Video/VideoThumbnail'
}

const Template: Story = ({ ...args }) => (
  <VideoThumbnail
    video={args.video}
    isPlaying={args.isPlaying}
    episode={args.episode}
  />
)

export const Default = Template.bind({})
Default.args = {
  video: {
    id: '1_cl-0-0',
    type: VideoType.standalone,
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
    variant: { duration: 3680, __typename: 'VideoVariant' },
    __typename: 'Video',
    episodeIds: [],
    slug: [
      {
        value: 'the-story-of-jesus-for-children',
        __typename: 'Translation'
      }
    ]
  },
  episode: 1
}

export const Playing = Template.bind({})
Playing.args = {
  ...Default.args,
  isPlaying: true
}

export default VideoThumbnailStory as Meta
