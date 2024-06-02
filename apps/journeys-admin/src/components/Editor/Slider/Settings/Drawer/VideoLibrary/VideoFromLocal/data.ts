import { GetVideos_videos as Video } from '../../../../../../../../__generated__/GetVideos'

export const videos: Video[] = [
  {
    __typename: 'Video',
    id: '2_Acts7302-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg',
    snippet: [
      {
        __typename: 'Translation',
        primary: true,
        value:
          'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
      }
    ],
    title: [
      {
        __typename: 'Translation',
        primary: true,
        value: "Andreas' Story"
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: 'variantA',
      duration: 186
    }
  },
  {
    __typename: 'Video',
    id: '2_0-Brand_Video',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-Brand_Video.mobileCinematicHigh.jpg',
    snippet: [
      {
        __typename: 'Translation',
        primary: true,
        value: 'Brand Video'
      }
    ],
    title: [
      {
        __typename: 'Translation',
        primary: true,
        value: 'Brand_Video'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: 'variantB',
      duration: 104
    }
  },
  {
    __typename: 'Video',
    id: '2_0-Demoniac',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-Demoniac.mobileCinematicHigh.jpg',
    snippet: [
      {
        __typename: 'Translation',
        primary: true,
        value:
          'Powerfully-told, this is the famous Biblical account of Jesus healing a man by casting out demons.'
      }
    ],
    title: [
      {
        __typename: 'Translation',
        primary: true,
        value: 'The Demoniac'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: 'variantC',
      duration: 209
    }
  }
]
