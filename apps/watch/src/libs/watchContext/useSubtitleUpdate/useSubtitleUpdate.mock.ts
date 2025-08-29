import { MockedResponse } from '@apollo/client/testing'

import {
  GetSubtitles,
  GetSubtitlesVariables
} from '../../../../__generated__/GetSubtitles'
import { VideoLabel } from '../../../../__generated__/globalTypes'

import { GET_SUBTITLES } from './useSubtitleUpdate'

export const mockVideoContent = {
  __typename: 'Video' as const,
  id: 'test-video-id',
  label: VideoLabel.series,
  images: [],
  imageAlt: [],
  snippet: [],
  description: [],
  studyQuestions: [],
  bibleCitations: [],
  title: [{ __typename: 'VideoTitle' as const, value: 'Test Video' }],
  variant: {
    __typename: 'VideoVariant' as const,
    id: 'test-variant-id',
    duration: 120,
    hls: null,
    downloadable: false,
    downloads: [],
    language: {
      __typename: 'Language' as const,
      id: 'en',
      name: [
        { __typename: 'LanguageName' as const, value: 'English', primary: true }
      ],
      bcp47: 'en'
    },
    slug: 'test-variant-slug',
    subtitleCount: 2
  },
  variantLanguagesCount: 1,
  slug: 'test-video-slug',
  childrenCount: 0
}

export const mockSubtitleData: GetSubtitles = {
  video: {
    __typename: 'Video' as const,
    variant: {
      __typename: 'VideoVariant' as const,
      subtitle: [
        {
          __typename: 'VideoSubtitle' as const,
          language: {
            __typename: 'Language' as const,
            id: '529',
            bcp47: 'en',
            name: [
              {
                __typename: 'LanguageName' as const,
                value: 'English',
                primary: true
              }
            ]
          },
          value: 'https://example.com/subtitles/english.vtt'
        },
        {
          __typename: 'VideoSubtitle' as const,
          language: {
            __typename: 'Language' as const,
            id: '22658',
            bcp47: 'es',
            name: [
              {
                __typename: 'LanguageName' as const,
                value: 'Spanish',
                primary: true
              }
            ]
          },
          value: 'https://example.com/subtitles/spanish.vtt'
        }
      ]
    }
  }
}

export const getSubtitlesMock: MockedResponse<
  GetSubtitles,
  GetSubtitlesVariables
> = {
  request: {
    query: GET_SUBTITLES,
    variables: { id: 'test-variant-slug' }
  },
  result: {
    data: mockSubtitleData
  }
}
