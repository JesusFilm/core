import { parentTags, tags } from '../data'

import { getSortedTags } from './getSortedTags'

describe('getSortedTags', () => {
  it('should sort by parentTagId, filter out tags with non existent parent tags', () => {
    expect(getSortedTags([...tags, { ...parentTags[0] }], parentTags)).toEqual([
      {
        __typename: 'Tag',
        id: 'tag1.id',
        parentId: 'tags.topic.id',
        service: null,
        name: [
          {
            __typename: 'Translation',
            value: 'Topic sub-tag',
            primary: true
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
            primary: true
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
            primary: true
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
            primary: true
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
            primary: true
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
            primary: true
          }
        ]
      }
    ])
  })

  it('should return null if journey tags are null', () => {
    expect(getSortedTags()).toBeNull()
  })

  it('should return an empty array if journey tags is an empty array', () => {
    expect(getSortedTags([], parentTags)).toEqual([])
  })
})
