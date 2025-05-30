import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  GET_JOURNEY_INTERNAL_VIDEOS,
  GET_VIDEOS_VARIANT_LANGUAGES
} from './useCommonVideoVariantLanguages'

export const journey = {
  __typename: 'Journey',
  id: 'journeyId',
  title: 'My journey'
} as unknown as Journey

export const journeyInternalVideosMock = {
  request: {
    query: GET_JOURNEY_INTERNAL_VIDEOS,
    variables: {
      journeyId: journey.id
    }
  },
  result: {
    data: {
      journey: {
        id: journey.id,
        blocks: [
          {
            __typename: 'VideoBlock',
            id: 'video1',
            videoId: 'video1Id',
            videoVariantLanguageId: '529',
            source: 'internal'
          },
          {
            __typename: 'TypographyBlock',
            id: 'typography1'
          },
          {
            __typename: 'VideoBlock',
            id: 'video2',
            videoId: 'video2Id',
            videoVariantLanguageId: '529',
            source: 'internal'
          }
        ]
      }
    }
  }
}

export const journeyInternalWithoutVideosMock = {
  request: {
    query: GET_JOURNEY_INTERNAL_VIDEOS,
    variables: {
      journeyId: journey.id
    }
  },
  result: {
    data: {
      journey: {
        id: journey.id,
        blocks: [
          {
            __typename: 'TypographyBlock',
            id: 'typography1'
          }
        ]
      }
    }
  }
}

export const videosVariantLanguagesMock = {
  request: {
    query: GET_VIDEOS_VARIANT_LANGUAGES,
    variables: {
      ids: ['video1Id', 'video2Id']
    }
  },
  result: {
    data: {
      videos: [
        {
          id: 'video1Id',
          variant: {
            id: 'variant1'
          },
          variants: [
            {
              language: {
                id: '529'
              }
            },
            {
              language: {
                id: '584'
              }
            }
          ]
        },
        {
          id: 'video2Id',
          variant: {
            id: 'variant2'
          },
          variants: [
            {
              language: {
                id: '529'
              }
            },
            {
              language: {
                id: '584'
              }
            },
            {
              language: {
                id: '3934'
              }
            }
          ]
        }
      ]
    }
  }
}

export const videosVariantLanguagesWithoutVideosMock = {
  request: {
    query: GET_VIDEOS_VARIANT_LANGUAGES,
    variables: {
      ids: []
    }
  },
  result: {
    data: {
      videos: []
    }
  }
}
