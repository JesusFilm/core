import type { TFunction } from 'next-i18next/pages'

import { hasText } from '../types'

const COUNT_SLOT = '{{count}}'

/**
 * "<n> videos" on a Watch container's card: the campaign's own `videos`
 * string in the Page Language when it has one — a `{{count}}` slot in it
 * places the number where the language wants it, else the count leads —
 * otherwise the interface translation with the count interpolated.
 */
export function videoCountLabel(
  count: number,
  campaignWord: string,
  t: TFunction
): string {
  if (hasText(campaignWord) && campaignWord.includes(COUNT_SLOT))
    return campaignWord.replaceAll(COUNT_SLOT, String(count))
  if (hasText(campaignWord)) return `${count} ${campaignWord}`
  return t('{{count}} videos', { count })
}
