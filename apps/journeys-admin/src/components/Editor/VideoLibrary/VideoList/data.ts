import { VideoBlockSource } from '../../../../../__generated__/globalTypes'

import { VideoListProps } from './VideoList'

export const videos: NonNullable<VideoListProps['videos']> = [
  {
    id: '2_Acts7302-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
    description:
      'After living a life full of fighter planes and porsches, Andreas realizes something is missing.',
    title: "Andreas' Story",
    duration: 186,
    source: VideoBlockSource.internal
  },
  {
    id: '2_0-Brand_Video',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-Brand_Video.mobileCinematicHigh.jpg',
    description: 'Brand Video',
    title: 'Brand_Video',
    source: VideoBlockSource.internal
  },
  {
    id: '2_0-Demoniac',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-Demoniac.mobileCinematicHigh.jpg',
    description:
      'Powerfully-told, this is the famous Biblical account of Jesus healing a man by casting out demons.',
    title: 'The Demoniac',
    source: VideoBlockSource.internal
  }
]
