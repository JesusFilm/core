import { GetHomeVideo_video } from '../../../__generated__/GetHomeVideo'
import { FilmType } from './Card/HomeVideoCard'
import { HomeVideo } from './HomeVideos'

export const videos: HomeVideo[] = [
  {
    id: '1_jf-0-0',
    designation: FilmType.feature
  },
  { id: '2_GOJ-0-0', designation: FilmType.feature },
  { id: 'rivka', designation: FilmType.series },
  { id: '2_Acts-0-0', designation: FilmType.feature },
  {
    id: '1_jf-0-0',
    designation: FilmType.feature
  },
  { id: '2_GOJ-0-0', designation: FilmType.feature },
  { id: 'rivka', designation: FilmType.series },
  { id: '2_Acts-0-0', designation: FilmType.feature },
  {
    id: '1_jf-0-0',
    designation: FilmType.feature
  },
  { id: '2_GOJ-0-0', designation: FilmType.feature },
  { id: 'rivka', designation: FilmType.series },
  { id: '2_Acts-0-0', designation: FilmType.feature },
  {
    id: '1_jf-0-0',
    designation: FilmType.feature
  },
  { id: '2_GOJ-0-0', designation: FilmType.feature },
  { id: 'rivka', designation: FilmType.series },
  { id: '2_Acts-0-0', designation: FilmType.feature }
]

export const data: GetHomeVideo_video[] = [
  {
    id: '1_cl-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
    title: [
      {
        value: 'The Story of Jesus for Children',
        __typename: 'Translation'
      }
    ],
    variant: { duration: 3680, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: [],
    slug: [
      {
        value: 'the-story-of-jesus-for-children',
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '1_jf-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg',
    title: [{ value: 'JESUS', __typename: 'Translation' }],
    variant: { duration: 7674, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: [],
    slug: [{ value: 'jesus', __typename: 'Translation' }]
  },
  {
    id: '1_wl-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_wl-0-0.mobileCinematicHigh.jpg',
    title: [
      {
        value: "Magdalena - Director's Cut",
        __typename: 'Translation'
      }
    ],
    variant: { duration: 4952, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: [],
    slug: [
      {
        value: 'magdalena-directors-cut',
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '2_Acts-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts-0-0.mobileCinematicHigh.jpg',
    title: [{ value: 'Book of Acts', __typename: 'Translation' }],
    variant: { duration: 11530, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: [],
    slug: [{ value: 'book-of-acts', __typename: 'Translation' }]
  },
  {
    id: '2_CSF',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_CSF.mobileCinematicHigh.jpg',
    title: [
      {
        value: 'A Day and a Night with Creator Sets Free',
        __typename: 'Translation'
      }
    ],
    variant: { duration: 343, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: [],
    slug: [
      {
        value: 'a-day-and-a-night-with-creator-sets-free',
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '2_GOJ-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
    title: [
      {
        value: 'Life of Jesus (Gospel of John)',
        __typename: 'Translation'
      }
    ],
    variant: { duration: 10994, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: [],
    slug: [
      {
        value: 'life-of-jesus-gospel-of-john',
        __typename: 'Translation'
      }
    ]
  },
  {
    id: 'MAG1',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/high_mag_collection_640x300br.jpg',
    title: [{ value: 'Magdalena', __typename: 'Translation' }],
    variant: { duration: 3665, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: [],
    slug: [{ value: 'magdalena', __typename: 'Translation' }]
  },
  {
    id: '1_0-TrainV_1Install',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/lrg_cine_install.jpg',
    title: [
      {
        value: 'Installing the Jesus Film Media App',
        __typename: 'Translation'
      }
    ],
    variant: { duration: 118, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: [],
    slug: [
      {
        value: 'installing-the-jesus-film-media-app',
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '1_riv-0-0',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_riv-0-0.mobileCinematicHigh.jpg',
    title: [
      {
        value: 'Rivka',
        __typename: 'Translation'
      }
    ],
    variant: { duration: 118, __typename: 'VideoVariant' },
    __typename: 'Video',
    childIds: ['1', '2'],
    slug: [
      {
        value: 'rivka',
        __typename: 'Translation'
      }
    ]
  }
]
