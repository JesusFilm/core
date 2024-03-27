import type { VideoPageFilter } from '../useVideoSearch'

export function checkFilterApplied(filter: VideoPageFilter): boolean {
  const filterToCheck = [
    filter.title,
    filter.availableVariantLanguageIds,
    filter.subtitleLanguageIds
  ]

  return filterToCheck.some(
    (value) => value !== undefined && value != null && value !== ''
  )
}
