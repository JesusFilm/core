import { TFunction } from 'i18next'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { JourneyLink, getJourneyLinks } from '../getJourneyLinks'
import { getJourneyMedia } from '../getJourneyMedia'

export type CustomizationScreen =
  | 'language'
  | 'text'
  | 'links'
  | 'media'
  | 'social'
  | 'done'
  | 'guestPreview'

/**
 * Screens that are not represented as steps in the progress stepper.
 * Add a screen here to exclude it from the step dot count.
 * For screens that should also hide the stepper entirely, add to STEPPER_HIDDEN_SCREENS too.
 */
export const STEPPER_EXCLUDED_SCREENS: ReadonlySet<CustomizationScreen> = new Set([
  'done',
  'guestPreview'
])

/**
 * Screens where the progress stepper is hidden entirely (must be a subset of STEPPER_EXCLUDED_SCREENS).
 */
export const STEPPER_HIDDEN_SCREENS: ReadonlySet<CustomizationScreen> = new Set(['done'])

export interface CustomizeFlowConfig {
  screens: CustomizationScreen[]
  totalSteps: number
  hasEditableText: boolean
  hasCustomizableLinks: boolean
  hasCustomizableMedia: boolean
  links: JourneyLink[]
}

export interface CustomizeFlowOptions {
  customizableMedia?: boolean
  /** When true, the guestPreview screen is included (e.g. user not signed in). Pass from useAuth().user. */
  isGuest?: boolean
}

/**
 * Calculates which customization screens should be shown based on the journey's capabilities.
 *
 * This function determines which screens to display in the multi-step form based on:
 * - Whether the journey has editable text (journeyCustomizationDescription and journeyCustomizationFields)
 * - Whether the journey has customizable links (chat buttons or blocks with customizable actions)
 *
 * The screens are always ordered as: language -> text (if applicable) -> links (if applicable) -> media (if applicable) -> social -> done
 *
 * @param journey - The journey object containing customization data
 * @param t - Translation function (optional, used for link detection)
 * @param options - Optional flags (e.g. customizableMedia) to include or exclude screens
 * @returns Configuration object with screens array, total steps, capability flags, and links
 *
 * @example
 * ```typescript
 * const config = getCustomizeFlowConfig(journey, t)
 * // config.screens might be ['language', 'text', 'links', 'media', 'social', 'done']
 * // config.totalSteps would be 6
 * // config.hasEditableText would be true
 * // config.hasCustomizableLinks would be true
 * // config.hasCustomizableMedia would be true
 * // config.links would contain the journey's customizable links
 * ```
 */
export function getCustomizeFlowConfig(
  journey?: Journey,
  t?: TFunction,
  options: CustomizeFlowOptions = {}
): CustomizeFlowConfig {
  // Default false: outage-safe; when flag is missing/undefined, hide media step (new feature off).
  const { customizableMedia: customizableMediaFlag = false, isGuest = false } =
    options

  // Always include language, social, and done screens
  const baseScreens: CustomizationScreen[] = ['language', 'social', 'done']

  // Get journey links
  const links = journey && t ? getJourneyLinks(t, journey) : []

  // Check for editable text
  const hasEditableText = Boolean(
    journey?.journeyCustomizationDescription &&
      journey.journeyCustomizationDescription.trim() !== '' &&
      journey?.journeyCustomizationFields &&
      journey.journeyCustomizationFields.length > 0
  )

  // Check for customizable links
  const hasCustomizableLinks = links.length > 0

  // Check for media (journey content only; screen inclusion also gated by flag)
  const hasCustomizableMedia = getJourneyMedia(journey).length > 0

  // Build screens array based on capabilities
  const screens: CustomizationScreen[] = [...baseScreens]

  if (hasEditableText) {
    // Insert text screen before social screen
    const socialIndex = screens.indexOf('social')
    screens.splice(socialIndex, 0, 'text')
  }

  if (hasCustomizableLinks) {
    // Insert links screen before social screen, but after text screen if it exists
    const socialIndex = screens.indexOf('social')
    screens.splice(socialIndex, 0, 'links')
  }

  if (isGuest) {
    // Insert guest preview screen before social screen
    const socialIndex = screens.indexOf('social')
    screens.splice(socialIndex, 0, 'guestPreview')
  }

  if (hasCustomizableMedia && customizableMediaFlag) {
    // Insert media screen before social screen
    const socialIndex = screens.indexOf('social')
    screens.splice(socialIndex, 0, 'media')
  }

  return {
    screens,
    totalSteps:
      screens.length -
      screens.filter((s) => STEPPER_EXCLUDED_SCREENS.has(s)).length,
    hasEditableText,
    hasCustomizableLinks,
    hasCustomizableMedia,
    links
  }
}
