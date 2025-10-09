import { TFunction } from 'i18next'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { JourneyLink, getJourneyLinks } from '../getJourneyLinks'

export type CustomizationScreen =
  | 'language'
  | 'text'
  | 'links'
  | 'social'
  | 'done'

export interface CustomizeFlowConfig {
  screens: CustomizationScreen[]
  totalSteps: number
  hasEditableText: boolean
  hasCustomizableLinks: boolean
  links: JourneyLink[]
}

/**
 * Calculates which customization screens should be shown based on the journey's capabilities.
 *
 * This function determines which screens to display in the multi-step form based on:
 * - Whether the journey has editable text (journeyCustomizationDescription and journeyCustomizationFields)
 * - Whether the journey has customizable links (chat buttons or blocks with customizable actions)
 *
 * The screens are always ordered as: language -> text (if applicable) -> links (if applicable) -> social -> done
 *
 * @param journey - The journey object containing customization data
 * @param t - Translation function (optional, used for link detection)
 * @returns Configuration object with screens array, total steps, capability flags, and links
 *
 * @example
 * ```typescript
 * const config = getCustomizeFlowConfig(journey, t)
 * // config.screens might be ['language', 'text', 'links', 'social', 'done']
 * // config.totalSteps would be 5
 * // config.hasEditableText would be true
 * // config.hasCustomizableLinks would be true
 * // config.links would contain the journey's customizable links
 * ```
 */
export function getCustomizeFlowConfig(
  journey?: Journey,
  t?: TFunction
): CustomizeFlowConfig {
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

  return {
    screens,
    totalSteps: screens.length,
    hasEditableText,
    hasCustomizableLinks,
    links
  }
}
