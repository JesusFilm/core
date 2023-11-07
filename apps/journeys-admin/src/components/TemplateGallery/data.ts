import { MockedResponse } from '@apollo/client/testing'

import {
  GetJourneys,
  GetJourneysVariables,
  GetJourneys_journeys as Journey,
  GetJourneys_journeys_tags as Tag
} from '../../../__generated__/GetJourneys'
import { GetLanguages } from '../../../__generated__/GetLanguages'
import { GetTags } from '../../../__generated__/GetTags'
import {
  JourneyStatus,
  Service,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { GET_JOURNEYS } from '../../libs/useJourneysQuery/useJourneysQuery'
import { GET_LANGUAGES } from '../../libs/useLanguagesQuery'
import { GET_TAGS } from '../../libs/useTagsQuery/useTagsQuery'

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
        __typename: 'Translation',
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
      __typename: 'Translation',
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
      __typename: 'Translation',
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

export const getLanguagesMock: MockedResponse<GetLanguages> = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      languageId: '529'
    }
  },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
          id: '529',
          name: [
            {
              value: 'English',
              primary: true,
              __typename: 'Translation'
            }
          ]
        },
        {
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
        },
        {
          id: '1106',
          __typename: 'Language',
          name: [
            {
              value: 'Deutsch',
              primary: true,
              __typename: 'Translation'
            },
            {
              value: 'German, Standard',
              primary: false,
              __typename: 'Translation'
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
              __typename: 'Translation',
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
              __typename: 'Translation',
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
              __typename: 'Translation',
              value: 'Depression',
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'fearTagId',
          service: null,
          parentId: 'parentId1',
          name: [
            {
              __typename: 'Translation',
              value: 'Fear/Anxiety',
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
              __typename: 'Translation',
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
              __typename: 'Translation',
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
              __typename: 'Translation',
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
              __typename: 'Translation',
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
              __typename: 'Translation',
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
              __typename: 'Translation',
              value: 'Significance',
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
              __typename: 'Translation',
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
              __typename: 'Translation',
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
              __typename: 'Translation',
              value: 'NUA',
              primary: true
            }
          ]
        }
      ]
    }
  }
}
