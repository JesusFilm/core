import compact from 'lodash/compact'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

export function getSortedTags(
  journeyTags?: Array<Tag & { parentId: string }>,
  parentTags?: Tag[]
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
      if (a.name[0].value === b.name[0].value) return 0
      if (a.name[0].value < b.name[0].value) return -1
      return 1
    })
    .sort((a, b) => {
      if (a.parentId === b.parentId) return 0
      if (
        sortedParentTagIds.indexOf(a.parentId) <
        sortedParentTagIds.indexOf(b.parentId)
      )
        return -1
      return 1
    })

  return sortedTags
}
