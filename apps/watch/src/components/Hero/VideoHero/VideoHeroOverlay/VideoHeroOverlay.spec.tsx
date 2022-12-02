import { render, fireEvent } from '@testing-library/react'
import { VideoType } from '../../../../../__generated__/globalTypes'
import { GetVideo_video as Video } from '../../../../../__generated__/GetVideo'
import { VideoHeroOverlay } from './VideoHeroOverlay'

describe('VideoHeroOverlay', () => {
  const video: Video = {
    id: '1_cl-0-0',
    __typename: 'Video',
    type: VideoType.standalone,
    description: [],
    studyQuestions: [],
    snippet: [],
    variantLanguages: [],
    children: [],
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

  it('should render the Video Hero Overlay', () => {
    const { getByRole, getByText, getByTestId } = render(
      <VideoHeroOverlay video={video} />
    )
    expect(getByText('The Story of Jesus for Children')).toBeInTheDocument()
    expect(getByText('61 min')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Play Video' })).toBeInTheDocument()
    expect(getByTestId('VolumeUpOutlinedIcon').parentElement).toHaveClass(
      'MuiIconButton-root'
    )
  })

  it('should play video on the Play Video button click', () => {
    const handlePlay = jest.fn()
    const { getByRole } = render(
      <VideoHeroOverlay video={video} handlePlay={handlePlay} />
    )
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(handlePlay).toHaveBeenCalled()
  })

  it('should mute video on the Mute Icon click', () => {
    const handleMute = jest.fn()
    const { getByTestId } = render(
      <VideoHeroOverlay video={video} handleMute={handleMute} />
    )
    fireEvent.click(getByTestId('VolumeUpOutlinedIcon'))
    expect(handleMute).toHaveBeenCalled()
  })
})
