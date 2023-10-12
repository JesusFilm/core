import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { TagItem } from './TagItem'

const tags: Tag[] = [
  {
    __typename: 'Tag',
    id: 'tag1.id',
    parentId: '8b7bd2e6-6eb5-4b48-a94f-4506e3b7b01d',
    name: [
      {
        __typename: 'Translation',
        value: 'tag1',
        primary: true,
        language: {
          __typename: 'Language',
          id: 'en'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag2.id',
    parentId: '36af9642-7176-4e94-b61a-95d0b57ad0bc',
    name: [
      {
        __typename: 'Translation',
        value: 'tag2',
        primary: true,
        language: {
          __typename: 'Language',
          id: 'en'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag3.id',
    parentId: '1673bb82-b776-446f-a6f6-d69d72ac2be6',
    name: [
      {
        __typename: 'Translation',
        value: 'tag3',
        primary: true,
        language: {
          __typename: 'Language',
          id: 'en'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag4.id',
    parentId: '85471d1f-edc5-4477-a9cd-30af697749c4',
    name: [
      {
        __typename: 'Translation',
        value: 'tag4',
        primary: true,
        language: {
          __typename: 'Language',
          id: 'en'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag5.id',
    parentId: '9b45707a-123a-4331-8722-65b010532531',
    name: [
      {
        __typename: 'Translation',
        value: 'tag5',
        primary: true,
        language: {
          __typename: 'Language',
          id: 'en'
        }
      }
    ]
  },
  {
    __typename: 'Tag',
    id: 'tag6.id',
    parentId: 'otherTag.id',
    name: [
      {
        __typename: 'Translation',
        value: 'tag6',
        primary: true,
        language: {
          __typename: 'Language',
          id: 'en'
        }
      }
    ]
  }
]

export function TemplateTags(): ReactElement {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={14}
      sx={{ height: '84px', py: 2 }}
    >
      {tags.map((tag, index) => (
        <>
          <TagItem key={tag.id} tag={tag} />
          {index < tags.length - 1 && (
            <Divider orientation="vertical" sx={{ height: '48px' }} />
          )}
        </>
      ))}
    </Stack>
  )
}
