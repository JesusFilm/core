import { CampaignMediaSide } from '@core/prisma/journeys/client'

import { assertEnum, badUserInput } from '../../validation'
import { validateSectionText } from '../validateSectionText'

export const CAMPAIGN_MEDIA_SIDES = Object.values(CampaignMediaSide)

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
}

/**
 * The Featured Media body: eyebrow ≤ 80, title ≤ 150, lede ≤ 500 and
 * bullets ≤ 1000 (one per line) trimmed and capped; `mediaSide` left or
 * right and never null. Omitted fields are left untouched. `BAD_USER_INPUT`
 * names the field.
 */
export function validateFeaturedMediaInput(input: FeaturedMediaInput): {
  eyebrow?: string | null
  title?: string | null
  lede?: string | null
  bullets?: string | null
  mediaSide?: CampaignMediaSide
} {
  const data: ReturnType<typeof validateFeaturedMediaInput> =
    validateSectionText(input, FEATURED_MEDIA_TEXT_FIELDS)
  if (input.mediaSide === undefined) return data
  if (input.mediaSide == null)
    throw badUserInput(
      `mediaSide must be one of ${CAMPAIGN_MEDIA_SIDES.join(', ')}`,
      'mediaSide'
    )
  data.mediaSide = assertEnum(
    input.mediaSide,
    'mediaSide',
    CAMPAIGN_MEDIA_SIDES
  )
  return data
}
