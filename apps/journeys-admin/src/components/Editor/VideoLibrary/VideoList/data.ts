import { VideoListItemProps } from './VideoListItem/VideoListItem'

export const videos: Array<
  Pick<
    VideoListItemProps,
    'id' | 'title' | 'description' | 'image' | 'duration'
  >
> = [
  {
    id: '2_Acts7302-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
    description:
      'After living a life full of fighter planes and porsches, Andreas realizes something is missing.',
    title: "Andreas' Story",
    duration: 186
  },
  {
    id: '2_0-Brand_Video',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-Brand_Video.mobileCinematicHigh.jpg',
    description: 'Brand Video',
    title: 'Brand_Video'
  },
  {
    id: '2_0-Demoniac',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-Demoniac.mobileCinematicHigh.jpg',
    description:
      'Powerfully-told, this is the famous Biblical account of Jesus healing a man by casting out demons.',
    title: 'The Demoniac'
  }
]
