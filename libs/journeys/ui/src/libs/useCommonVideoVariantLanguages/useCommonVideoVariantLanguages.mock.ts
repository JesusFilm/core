import { GET_LANGUAGES } from '../useLanguagesQuery'

import {
  GET_JOURNEY_INTERNAL_VIDEOS,
  GET_VIDEOS_VARIANT_LANGUAGES
} from './useCommonVideoVariantLanguages'

export const journey = {
  id: 'journey-id'
}

export const languagesMock = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      languageId: '529',
      where: {
        ids: ['529', '496', '21028'] // assuming these are in SUPPORTED_LANGUAGE_IDS
      }
    }
  },
  result: {
    data: {
      languages: [
        {
          id: '529',
          slug: 'english',
          name: [
            {
              value: 'English',
              primary: true,
              __typename: 'LanguageName'
            }
          ]
        },
        {
          id: '21028',
          slug: 'spanish-latin-american',
          name: [
            {
              value: 'Español',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'Spanish, Latin American',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        },
        {
          id: '496',
          slug: 'french',
          name: [
            {
              value: 'Français',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'French',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        }
      ]
    }
  }
}

export const journeyInternalVideosMock = {
  request: {
    query: GET_JOURNEY_INTERNAL_VIDEOS,
    variables: {
      journeyId: 'journey-id'
    }
  },
  result: {
    data: {
      journey: {
        id: 'journey-id',
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
      journeyId: 'journey-id'
    }
  },
  result: {
    data: {
      journey: {
        id: 'journey-id',
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
                id: '496'
              }
            },
            {
              language: {
                id: '21028'
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
                id: '496'
              }
            },
            {
              language: {
                id: '21028'
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
