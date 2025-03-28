import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  VideoLabel,
  VideoVariantDownloadQuality
} from '../../../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../../../__generated__/VideoContentFields'
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
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_cl-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    imageAlt: [
      {
        __typename: 'VideoImageAlt',
        value: 'The Story of Jesus for Children'
      }
    ],
    variant: {
      id: '1_529-cl-0-0',
      language: {
        __typename: 'Language',
        id: '529',
        bcp47: 'en',
        name: [
          {
            __typename: 'LanguageName',
            value: 'English',
            primary: true
          }
        ]
      },
      downloadable: true,
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
      slug: 'the-story-of-jesus-for-children/english',
      subtitleCount: 1
    },
    title: [
      {
        value: 'The Story of Jesus for Children',
        __typename: 'VideoTitle'
      }
    ],
    variantLanguagesCount: 1,
    slug: 'the-story-of-jesus-for-children',
    childrenCount: 0
  }

  it('should render the Video Hero Overlay', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <VideoHeroOverlay />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('The Story of Jesus for Children')).toBeInTheDocument()
    expect(getByText('{{ duration }} min')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Play Video' })).toBeInTheDocument()
  })

  it('should play video on the Play Video button click', () => {
    const handlePlay = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: video }}>
            <VideoHeroOverlay handlePlay={handlePlay} />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(handlePlay).toHaveBeenCalled()
  })
})
