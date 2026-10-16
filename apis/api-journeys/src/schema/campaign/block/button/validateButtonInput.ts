import {
  CampaignAlign,
  CampaignButtonSize,
  CampaignButtonVariant
} from '@core/prisma/journeys/client'

import {
  TEXT_CAPS,
  assertEnumOrNull,
  assertHexOrNull,
  assertLengthOrNull
} from '../../validation'
import { CAMPAIGN_ALIGNS } from '../typography/validateTypographyInput'

export const BUTTON_VARIANTS = Object.values(CampaignButtonVariant)
export const BUTTON_SIZES = Object.values(CampaignButtonSize)

/** The label a new button Extra is born with (PRD §14). */
export const NEW_BUTTON_LABEL = 'Button'

export interface ButtonInput {
  label?: string | null
  variant?: string | null
  size?: string | null
  align?: string | null
  color?: string | null
  labelColor?: string | null
}

export interface ButtonColumns {
  label?: string | null
  buttonVariant?: CampaignButtonVariant | null
  buttonSize?: CampaignButtonSize | null
  align?: CampaignAlign | null
  color?: string | null
  labelColor?: string | null
}

/**
 * `label` ≤ 60 (empty allowed); `variant` text, contained, outlined or null
 * (⇒ contained); `size` small, medium, large or null (⇒ medium); `align`
 * left, center, right or null (⇒ follow the section); `color` and
 * `labelColor` normalised hex or null. Omitted fields are left untouched.
 */
export function validateButtonInput(input: ButtonInput): ButtonColumns {
  const data: ButtonColumns = {}
  if (input.label !== undefined)
    data.label = assertLengthOrNull(input.label, 'label', TEXT_CAPS.buttonLabel)
  if (input.variant !== undefined)
    data.buttonVariant = assertEnumOrNull(
      input.variant,
      'variant',
      BUTTON_VARIANTS
    )
  if (input.size !== undefined)
    data.buttonSize = assertEnumOrNull(input.size, 'size', BUTTON_SIZES)
  if (input.align !== undefined)
    data.align = assertEnumOrNull(input.align, 'align', CAMPAIGN_ALIGNS)
  if (input.color !== undefined)
    data.color = assertHexOrNull(input.color, 'color')
  if (input.labelColor !== undefined)
    data.labelColor = assertHexOrNull(input.labelColor, 'labelColor')
  return data
}
