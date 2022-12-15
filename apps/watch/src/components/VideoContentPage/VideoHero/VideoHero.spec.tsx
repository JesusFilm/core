import { render } from '@testing-library/react'
import { VideoProvider } from '../../../libs/videoContext'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { VideoHero } from './VideoHero'

describe('VideoHero', () => {
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

  it('should render the video through variant hls', async () => {
    const { getByTestId } = render(
      <VideoProvider value={{ content: video }}>
        <VideoHero />
      </VideoProvider>
    )
    getByTestId('video-1_cl-0-0').querySelector('.vjs-tech source')
  })
})
