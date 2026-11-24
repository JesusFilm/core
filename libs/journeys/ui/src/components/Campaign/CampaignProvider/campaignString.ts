import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { hasText } from '../types'

/**
 * A Campaign String's value: empty when the campaign lacks the row or the
 * value is blank, so every caller falls back on `hasText` the same way.
 */
export function campaignString(
  strings: ReadonlyArray<{ key: CampaignStringKey; value: string }>,
  key: CampaignStringKey
): string {
  const value = strings.find((candidate) => candidate.key === key)?.value
  return hasText(value) ? value : ''
}

/**
 * A Campaign String's value, else `fallback` when the campaign lacks the row
 * or the value is blank: the wording a control needs even when the author
 * cleared it, such as an accessible name.
 */
export function campaignStringOr(
  strings: ReadonlyArray<{ key: CampaignStringKey; value: string }>,
  key: CampaignStringKey,
  fallback: string
): string {
  const value = campaignString(strings, key)
  return hasText(value) ? value : fallback
}
