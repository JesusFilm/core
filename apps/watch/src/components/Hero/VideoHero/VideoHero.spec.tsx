import { render, fireEvent } from '@testing-library/react'
import { VideoType } from '../../../../__generated__/globalTypes'
import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'
import { VideoHero } from './VideoHero'

describe('VideoHero', () => {
  const Video: Video = {
    id: '1_cl-0-0',
    __typename: 'Video',
    type: VideoType.standalone,
    description: [],
    studyQuestions: [],
    snippet: [],
    episodes: [],
    variantLanguages: [],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_cl-0-0.mobileCinematicHigh.jpg',
    variant: {
      duration: 3680,
      __typename: 'VideoVariant',
      hls: 'https://arc.gt/zbrvj'
    },
    title: [
      {
        value: 'The Story of Jesus for Children',
        __typename: 'Translation'
      }
    ],
    slug: [
      {
        value: 'the-story-of-jesus-for-children',
        __typename: 'Translation'
      }
    ]
  }

  it('should render VideoHero', () => {
    const { getByText, getByTestId } = render(<VideoHero video={Video} />)
    expect(getByText('The Story of Jesus for Children')).toBeInTheDocument()
    expect(getByText('61 min'))
    expect(getByTestId('AccessTimeIcon')).toBeInTheDocument()
  })

  it('should play video on play video button click', () => {
    const { getByRole, queryByText } = render(<VideoHero video={Video} />)
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(
      queryByText('The Story of Jesus for Children')
    ).not.toBeInTheDocument()
  })
})
