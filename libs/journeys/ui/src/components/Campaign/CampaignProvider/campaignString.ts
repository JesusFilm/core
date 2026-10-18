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
