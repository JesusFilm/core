import { render, fireEvent } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
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
            value: 'English',
            primary: true
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
      slug: 'the-story-of-jesus-for-children/english',
      subtitle: [
        {
          __typename: 'Translation',
          language: {
            __typename: 'Language',
            bcp47: 'ar',
            id: '22658',
            name: [
              {
                __typename: 'Translation',
                value: ' اللغة العربية',
                primary: true
              },
              {
                __typename: 'Translation',
                value: 'Arabic, Modern Standard',
                primary: false
              }
            ]
          },
          value:
            'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
        }
      ],
      subtitleCount: 1
    },

    title: [
      {
        value: 'The Story of Jesus for Children',
        __typename: 'Translation'
      }
    ],
    variantLanguagesWithSlug: [
      {
        __typename: 'LanguageWithSlug',
        slug: 'the-story-of-jesus-for-children/french',
        language: {
          id: '496',
          __typename: 'Language',
          name: [
            {
              value: 'Français',
              primary: true,
              __typename: 'Translation'
            },
            {
              value: 'French',
              primary: false,
              __typename: 'Translation'
            }
          ]
        }
      }
    ],
    slug: 'the-story-of-jesus-for-children'
  }

  it('should render the Video Hero Overlay', () => {
    const { getByRole, getByText, getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoHeroOverlay />
        </VideoProvider>
      </SnackbarProvider>
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
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoHeroOverlay handlePlay={handlePlay} />
        </VideoProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Play Video' }))
    expect(handlePlay).toHaveBeenCalled()
  })

  it('should play video on the Mute Icon click', () => {
    const handlePlay = jest.fn()
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoHeroOverlay handlePlay={handlePlay} />
        </VideoProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByTestId('VolumeOffOutlinedIcon'))
    expect(handlePlay).toHaveBeenCalled()
  })
})
