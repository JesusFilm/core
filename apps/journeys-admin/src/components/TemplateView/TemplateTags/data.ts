import { GetTags_tags as Tag } from '../../../../__generated__/GetTags'

export const parentTags: Tag[] = [
  {
    __typename: 'Tag',
    id: 'tags.topic.id',
    service: null,
    parentId: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Topics',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tags.feltNeeds.id',
    parentId: null,
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Felt Needs',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tags.holidays.id',
    parentId: null,
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Holidays',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tags.audience.id',
    parentId: null,
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Audience',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tags.genre.id',
    parentId: null,
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Genre',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tags.collections.id',
    parentId: null,
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Collections',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tags.other.id',
    parentId: null,
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Other',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  }
]

export const tags: Tag[] = [
  {
    __typename: 'Tag',
    id: 'tag1.id',
    parentId: 'tags.topic.id',
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Topic sub-tag',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag2.id',
    parentId: 'tags.feltNeeds.id',
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Felt Needs sub-tag',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag3.id',
    parentId: 'tags.holidays.id',
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Holidays sub-tag',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag4.id',
    parentId: 'tags.audience.id',
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Audience sub-tag',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag5.id',
    parentId: 'tags.genre.id',
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Genre sub-tag',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag6.id',
    parentId: 'tags.collections.id',
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Collections sub-tag',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag7.id',
    parentId: 'otherTag.id',
    service: null,
    name: [
      {
        __typename: 'Translation',
        value: 'Other Tag',
        primary: true,
        language: {
          __typename: 'Language',
          id: '529'
        }
      }
    ]
  }
]
