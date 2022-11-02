import { render } from '@testing-library/react'
import { VideoType } from '../../../../__generated__/globalTypes'
import { GetVideos_videos as Video } from '../../../../__generated__/GetVideos'
import { VideoThumbnail } from './VideoThumbnail'

describe('VideoThumbnail', () => {
  const video: Video = {
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
  }
  it('should render the thumbnail of video', () => {
    const { getByRole, getByText } = render(
      <VideoThumbnail video={video} episode={1} />
    )
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg'
    )
    expect(getByText('01:01:20')).toBeInTheDocument()
    expect(getByText('Episode 1')).toBeInTheDocument()
    expect(getByText('The Story of Jesus for Children')).toBeInTheDocument()
  })

  it('should render the thumbnail of video playing', () => {
    const { getByRole, getByText } = render(
      <VideoThumbnail video={video} episode={1} isPlaying />
    )
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg'
    )
    expect(getByText('Playing Now')).toBeInTheDocument()
    expect(getByText('Episode 1')).toBeInTheDocument()
    expect(getByText('The Story of Jesus for Children')).toBeInTheDocument()
  })
})
