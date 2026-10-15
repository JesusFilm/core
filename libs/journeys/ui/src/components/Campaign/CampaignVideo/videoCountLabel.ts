import type { TFunction } from 'next-i18next/pages'

import { hasText } from '../types'

/**
 * "<n> videos" on a Watch container's card: the campaign's own `videos`
 * string in the Page Language when it has one, else the interface
 * translation with the count interpolated so word order stays the
 * translator's.
 */
export function videoCountLabel(
  count: number,
  campaignWord: string,
  t: TFunction
): string {
  if (hasText(campaignWord)) return `${count} ${campaignWord}`
  return t('{{count}} videos', { count })
}
