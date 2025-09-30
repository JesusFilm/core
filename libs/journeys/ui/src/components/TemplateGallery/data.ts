import { MockedResponse } from '@apollo/client/testing'

import {
  JourneyStatus,
  Service,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery'
import {
  GetJourneys,
  GetJourneysVariables,
  GetJourneys_journeys as Journey,
  GetJourneys_journeys_tags as Tag
} from '../../libs/useJourneysQuery/__generated__/GetJourneys'
import { GET_LANGUAGES } from '../../libs/useLanguagesQuery'
import { GetLanguages } from '../../libs/useLanguagesQuery/__generated__/GetLanguages'
import { GET_TAGS } from '../../libs/useTagsQuery'
import { GetTags } from '../../libs/useTagsQuery/__generated__/GetTags'

const defaultTemplate: Journey = {
  __typename: 'Journey',
  trashedAt: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.dark,
  id: '1',
  title: 'New Template 1',
  description: null,
  slug: 'default',
  template: true,
  language: {
    __typename: 'Language',
    id: '529',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  tags: [],
  primaryImageBlock: {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: 0,
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
  },
  publishedAt: '2023-08-14T04:24:24.392Z',
  createdAt: '2023-08-14T04:24:24.392Z',
  featuredAt: '2023-08-14T04:24:24.392Z',
  updatedAt: '2023-08-14T04:24:24.392Z',
  status: JourneyStatus.published,
  seoTitle: null,
  seoDescription: null,
  userJourneys: []
}

const acceptance: Tag = {
  __typename: 'Tag',
  id: 'acceptanceTagId',
  name: [
    {
      value: 'Acceptance',
      primary: true,
      __typename: 'TagName',
      language: {
        __typename: 'Language',
        id: 'en'
      }
    }
  ],
  parentId: 'parentId'
}

const hope: Tag = {
  __typename: 'Tag',
  id: 'hopeTagId',
  name: [
    {
      value: 'Hope',
      primary: true,
      __typename: 'TagName',
      language: {
        __typename: 'Language',
        id: 'en'
      }
    }
  ],
  parentId: 'parentId'
}

const journeys: Journey[] = [
  {
    ...defaultTemplate,
    id: 'featuredId1',
    title: 'Featured Template 1',
    createdAt: '2023-09-05T23:27:45.596Z',
    tags: [hope]
  },
  {
    ...defaultTemplate,
    id: 'featuredId2',
    title: 'Featured Template 2',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [hope]
  },
  {
    ...defaultTemplate,
    id: 'featuredId3',
    title: 'Featured Template 3',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [acceptance]
  },
  {
    ...defaultTemplate,
    id: 'newId1',
    title: 'New Template 1',
    createdAt: '2023-09-05T23:27:45.596Z',
    tags: [acceptance, hope],
    featuredAt: null
  },
  {
    ...defaultTemplate,
    id: 'newId2',
    title: 'New Template 2',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [acceptance, hope],
    featuredAt: null
  },
  {
    ...defaultTemplate,
    id: 'newId3',
    title: 'New Template 3',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [acceptance, hope],
    featuredAt: null
  },
  {
    ...defaultTemplate,
    id: 'newId4',
    title: 'New Template 4',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [acceptance, hope],
    featuredAt: null
  },
  {
    ...defaultTemplate,
    id: 'newId5',
    title: 'New Template 5',
    createdAt: '2023-08-05T23:27:45.596Z',
    tags: [acceptance, hope],
    featuredAt: null
  }
]

export const getJourneysMock: MockedResponse<
  GetJourneys,
  GetJourneysVariables
> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        languageIds: ['529']
      }
    }
  },
  result: {
    data: {
      journeys
    }
  }
}

export const getJourneysMockWithAcceptanceTag: MockedResponse<
  GetJourneys,
  GetJourneysVariables
> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: ['acceptanceTagId'],
        languageIds: ['529']
      }
    }
  },
  result: {
    data: {
      journeys
    }
  }
}

export const getJourneysMockWithoutTagsEnglish: MockedResponse<
  GetJourneys,
  GetJourneysVariables
> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: undefined,
        languageIds: ['529']
      }
    }
  },
  result: {
    data: {
      journeys
    }
  }
}

export const getJourneysMockWithoutTagsFrench: MockedResponse<
  GetJourneys,
  GetJourneysVariables
> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds: undefined,
        languageIds: ['496']
      }
    }
  },
  result: {
    data: {
      journeys
    }
  }
}

export const getJourneysWithoutLanguageIdsMock: MockedResponse<
  GetJourneys,
  GetJourneysVariables
> = {
  request: {
    query: GET_JOURNEYS,
    variables: {
      where: {
        template: true,
        orderByRecent: true
      }
    }
  },
  result: {
    data: {
      journeys
    }
  }
}

export const getLanguagesMock: MockedResponse<GetLanguages> = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      languageId: '529',
      where: {
        ids: [
          '529',
          '4415',
          '1106',
          '4451',
          '496',
          '20526',
          '584',
          '21028',
          '20615',
          '3934',
          '22658',
          '7083',
          '16639',
          '3887',
          '13169',
          '6464',
          '12876',
          '53441',
          '1942',
          '5541',
          '6788',
          '3804',
          '1927',
          '1370'
        ]
      }
    }
  },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
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
          id: '496',
          __typename: 'Language',
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
        },
        {
          id: '1106',
          __typename: 'Language',
          slug: 'german-standard',
          name: [
            {
              value: 'Deutsch',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'German, Standard',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        }
      ]
    }
  }
}

export const getTagsMock: MockedResponse<GetTags> = {
  request: {
    query: GET_TAGS
  },
  result: {
    data: {
      tags: [
        {
          __typename: 'Tag',
          id: 'parentId1',
          service: null,
          parentId: null,
          name: [
            {
              __typename: 'TagName',
              value: 'Felt Needs',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'acceptanceTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Acceptance',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'depressionTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Depression',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'anxietyTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Anxiety',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'forgivenessTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Forgiveness',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'hopeTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Hope',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'lonelinessTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Loneliness',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'loveTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Love',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'securityTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Security',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'significanceTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Significance',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'fearPowerTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'TagName',
              value: 'Fear/Power',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'parentId2',
          service: null,
          parentId: null,
          name: [
            {
              __typename: 'TagName',
              value: 'Collections',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'jesusFilmTagId',
          service: Service.apiJourneys,
          parentId: 'parentId2',
          name: [
            {
              __typename: 'TagName',
              value: 'Jesus Film',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'nuaTagId',
          service: Service.apiJourneys,
          parentId: 'parentId2',
          name: [
            {
              __typename: 'TagName',
              value: 'NUA',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'parentId3',
          service: null,
          parentId: null,
          name: [
            {
              __typename: 'TagName',
              value: 'Topics',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'addictionTagId',
          service: null,
          parentId: 'parentId3',
          name: [
            {
              __typename: 'TagName',
              value: 'Addiction',
              primary: true
            }
          ]
        }
      ]
    }
  }
}
