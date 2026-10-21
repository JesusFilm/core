import {
  CampaignFeaturedMediaLayout,
  CampaignMediaSide
} from '@core/prisma/journeys/client'

import { assertEnum, assertNotNull } from '../../validation'
import { validateSectionText } from '../validateSectionText'

export const CAMPAIGN_MEDIA_SIDES = Object.values(CampaignMediaSide)

export const CAMPAIGN_FEATURED_MEDIA_LAYOUTS = Object.values(
  CampaignFeaturedMediaLayout
)

export const FEATURED_MEDIA_TEXT_FIELDS = [
  'eyebrow',
  'title',
  'lede',
  'bullets'
] as const

export interface FeaturedMediaInput {
  eyebrow?: string | null
  title?: string | null
  lede?: string | null
  bullets?: string | null
  mediaSide?: string | null
  layout?: string | null
}

/**
 * The Featured Media body: eyebrow ≤ 80, title ≤ 150, lede ≤ 500 and
 * bullets ≤ 1000 (one per line) trimmed and capped; `mediaSide` left or
 * right and `layout` sideBySide or stacked, neither ever null. Omitted
 * fields are left untouched. `BAD_USER_INPUT` names the field.
 */
export function validateFeaturedMediaInput(input: FeaturedMediaInput): {
  eyebrow?: string | null
  title?: string | null
  lede?: string | null
  bullets?: string | null
  mediaSide?: CampaignMediaSide
  layout?: CampaignFeaturedMediaLayout
} {
  const data: ReturnType<typeof validateFeaturedMediaInput> =
    validateSectionText(input, FEATURED_MEDIA_TEXT_FIELDS)
  const mediaSide = assertNotNull(input.mediaSide, 'mediaSide')
  if (mediaSide !== undefined)
    data.mediaSide = assertEnum(mediaSide, 'mediaSide', CAMPAIGN_MEDIA_SIDES)
  const layout = assertNotNull(input.layout, 'layout')
  if (layout !== undefined)
    data.layout = assertEnum(layout, 'layout', CAMPAIGN_FEATURED_MEDIA_LAYOUTS)
  return data
}
