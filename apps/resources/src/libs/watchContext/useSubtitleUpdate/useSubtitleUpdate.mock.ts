import { MockedResponse } from '@apollo/client/testing'

import { ResultOf, VariablesOf } from '@core/shared/gql'

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

type GetSubtitles = ResultOf<typeof GET_SUBTITLES>

export const mockSubtitleData: GetSubtitles = {
  video: {
    variant: {
      subtitle: [
        {
          language: {
            id: '529',
            bcp47: 'en',
            name: [
              {
                value: 'English'
              }
            ]
          },
          value: 'https://example.com/subtitles/english.vtt'
        },
        {
          language: {
            id: '22658',
            bcp47: 'es',
            name: [
              {
                value: 'Spanish'
              }
            ]
          },
          value: 'https://example.com/subtitles/spanish.vtt'
        }
      ]
    }
  }
}

type GetSubtitlesVariables = VariablesOf<typeof GET_SUBTITLES>

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
