import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { VideoContentFields } from '../../../../../__generated__/VideoContentFields'
import {
  VideoLabel,
  VideoVariantDownloadQuality
} from '../../../../../__generated__/globalTypes'
import { VideoProvider } from '../../../../libs/videoContext'
import { VideoHeroOverlay } from './VideoHeroOverlay'

describe('VideoHeroOverlay', () => {
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
      downloads: [
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.low,
          size: 13138402,
          url: 'https://arc.gt/ist3s'
        },
        {
          __typename: 'VideoVariantDownload',
          quality: VideoVariantDownloadQuality.high,
          size: 149736452,
          url: 'https://arc.gt/zxqki'
        }
      ],
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

  it('should render the Video Hero Overlay', () => {
    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: video }}>
          <VideoHeroOverlay />
        </VideoProvider>
      </MockedProvider>
    )
    expect(getByText('The Story of Jesus for Children')).toBeInTheDocument()
    expect(getByText('61 min')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Play Video' })).toBeInTheDocument()
    expect(getByTestId('VolumeOffOutlinedIcon').parentElement).toHaveClass(
      'MuiIconButton-root'
    )
  })

  it('should play video on the Play Video button click', () => {
    const handlePlay = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <VideoProvider value={{ content: video }}>
          <VideoHeroOverlay handlePlay={handlePlay} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(handlePlay).toHaveBeenCalled()
  })

  it('should play video on the Mute Icon click', () => {
    const handlePlay = jest.fn()
    const { getByTestId } = render(
      <MockedProvider>
        <VideoProvider value={{ content: video }}>
          <VideoHeroOverlay handlePlay={handlePlay} />
        </VideoProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('VolumeOffOutlinedIcon'))
    expect(handlePlay).toHaveBeenCalled()
  })
})
