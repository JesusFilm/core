import { VideoPageFilter } from '../getQueryParameters'

export function checkFilterApplied(filter: VideoPageFilter): boolean {
  const filterToCheck = [
    filter.title,
    filter.availableVariantLanguageIds,
    filter.subtitleLanguageIds
  ]

  return filterToCheck.some((value) => value != null && value !== '')
}
