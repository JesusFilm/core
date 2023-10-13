import Calendar4Icon from '@core/shared/ui/icons/Calendar4'
import Hash2Icon from '@core/shared/ui/icons/Hash2'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import SmileyNeutralIcon from '@core/shared/ui/icons/SmileyNeutral'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { GetTags_tags as Tag } from '../../../../../__generated__/GetTags'

import { getParentTagsWithIcon } from '.'

describe('getParentTagsWithIcon', () => {
  it('should return parent tags wih icons', () => {
    const parentTags: Tag[] = [
      {
        __typename: 'Tag',
        id: 'tag1.id',
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
        id: 'tag2.id',
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
        id: 'tag3.id',
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
        id: 'tag4.id',
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
        id: 'tag5.id',
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
        id: 'tag6.id',
        parentId: 'otherTag.id',
        service: null,
        name: [
          {
            __typename: 'Translation',
            value: 'tag6',
            primary: true,
            language: {
              __typename: 'Language',
              id: '529'
            }
          }
        ]
      }
    ]

    expect(getParentTagsWithIcon(parentTags)).toEqual([
      {
        id: 'tag1.id',
        name: 'Topics',
        icon: <Hash2Icon />
      },
      {
        id: 'tag2.id',
        name: 'Felt Needs',
        icon: <SmileyNeutralIcon />
      },
      {
        id: 'tag3.id',
        name: 'Holidays',
        icon: <Calendar4Icon />
      },
      {
        id: 'tag4.id',
        name: 'Audience',
        icon: <UsersProfiles2Icon />
      },
      {
        id: 'tag5.id',
        name: 'Genre',
        icon: <MediaStrip1Icon />
      }
    ])
  })
})
