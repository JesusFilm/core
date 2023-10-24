import compact from 'lodash/compact'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetTags_tags as ParentTag } from '../../../../../__generated__/GetTags'

export function getSortedTags(
  journeyTags?: Tag[],
  parentTags?: ParentTag[]
): Tag[] | null {
  if (journeyTags == null) return null
  if (journeyTags.length < 1) return []

  const sortedParentTagIds = compact(
    [
      'Topics',
      'Felt Needs',
      'Holidays',
      'Audience',
      'Genre',
      'Collections'
    ].map((tagName) => {
      return (parentTags ?? []).find(({ name }) =>
        name.some(({ value }) => value === tagName)
      )?.id
    })
  )

  const sortedTags = journeyTags
    .filter(({ parentId }) =>
      sortedParentTagIds.some((tagId) => tagId === parentId)
    )
    .sort((a, b) => {
      if (a.parentId === b.parentId) return 0
      if (
        sortedParentTagIds.indexOf(a.parentId ?? '') <
        sortedParentTagIds.indexOf(b.parentId ?? '')
      )
        return -1
      return 1
    })

  return sortedTags
}
