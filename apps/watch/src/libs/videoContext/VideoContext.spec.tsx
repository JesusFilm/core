import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import {
  VideoLabel,
  VideoVariantDownloadQuality
} from '../../../__generated__/globalTypes'
import { videos } from '../../components/Videos/testData'
import { VideoProvider, useVideo } from './VideoContext'

const chapter1: VideoContentFields = {
  __typename: 'Video',
  id: '1_jf6101-0-0',
  label: VideoLabel.segment,
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf6101-0-0.mobileCinematicHigh.jpg',
  imageAlt: [{ __typename: 'Translation', value: 'The Beginning' }],
  snippet: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.'
    }
  ],
  description: [
    {
      __typename: 'Translation',
      value:
        'The story of Jesus fits within the larger story of the Judeo Christian tradition. The purpose of everything since creation has been to point to the life of Jesus.\n\nAll of creation speaks of the majesty of God. As God created man and woman he intended them to live in peace with him forever. But because of their disobedience mankind was separated from God. But God still loved mankind so throughout the Scriptures God reveals his plan to save the world.'
    }
  ],
  studyQuestions: [],
  title: [{ __typename: 'Translation', value: 'The Beginning' }],
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf6101-0-0',
    duration: 488,
    hls: 'https://arc.gt/pm6g1',
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
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English', primary: true }]
    },
    slug: 'the-beginning/english',
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
  variantLanguagesWithSlug: [
    {
      __typename: 'LanguageWithSlug',
      slug: 'the-beginning/french',
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
  slug: 'the-beginning',
  children: []
}

const handleClick = jest.fn()

const TestComponent = (): ReactElement => {
  const video = useVideo()

  return (
    <button
      onClick={() => {
        handleClick(video)
      }}
    />
  )
}

describe('VideoContext', () => {
  it('should pass the video data', () => {
    const { getByRole } = render(
      <VideoProvider
        value={{
          content: chapter1,
          container: videos[0]
        }}
      >
        <TestComponent />
      </VideoProvider>
    )

    fireEvent.click(getByRole('button'))

    expect(handleClick).toHaveBeenCalledWith({
      ...chapter1,
      container: videos[0]
    })
  })
})
