import {
  CampaignAlign,
  CampaignTypographyVariant
} from '@core/prisma/journeys/client'

import {
  TEXT_CAPS,
  assertEnumOrNull,
  assertHexOrNull,
  assertLengthOrNull
} from '../../validation'

export const TYPOGRAPHY_VARIANTS = Object.values(CampaignTypographyVariant)
export const CAMPAIGN_ALIGNS = Object.values(CampaignAlign)

export interface TypographyInput {
  content?: string | null
  variant?: string | null
  align?: string | null
  color?: string | null
}

export interface TypographyColumns {
  content?: string | null
  typographyVariant?: CampaignTypographyVariant | null
  align?: CampaignAlign | null
  color?: string | null
}

/**
 * `content` ≤ 2000 (empty allowed); `variant` one of core's twelve values or
 * null (⇒ body1); `align` left, center, right or null (⇒ follow the section);
 * `color` normalised hex or null. Omitted fields are left untouched.
 */
export function validateTypographyInput(
  input: TypographyInput
): TypographyColumns {
  const data: TypographyColumns = {}
  if (input.content !== undefined)
    data.content = assertLengthOrNull(
      input.content,
      'content',
      TEXT_CAPS.typographyContent
    )
  if (input.variant !== undefined)
    data.typographyVariant = assertEnumOrNull(
      input.variant,
      'variant',
      TYPOGRAPHY_VARIANTS
    )
  if (input.align !== undefined)
    data.align = assertEnumOrNull(input.align, 'align', CAMPAIGN_ALIGNS)
  if (input.color !== undefined)
    data.color = assertHexOrNull(input.color, 'color')
  return data
}
