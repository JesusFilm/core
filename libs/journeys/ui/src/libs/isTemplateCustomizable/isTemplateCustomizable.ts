import { GetJourneys_journeys as Journey } from '../useJourneysQuery/__generated__/GetJourneys'

/**
 * Determines if a template journey is customizable based on customization fields.
 * This is a simplified version of isJourneyCustomizable that only checks for text field customization.
 *
 * @param journey - The journey template to check
 * @returns true if the journey has customization description and fields
 */
export function isTemplateCustomizable(journey?: Journey): boolean {
  if (!journey) return false

  const hasEditableText = Boolean(
    journey.journeyCustomizationDescription &&
      journey.journeyCustomizationDescription.trim() !== '' &&
      journey.journeyCustomizationFields &&
      journey.journeyCustomizationFields.length > 0
  )

  return hasEditableText
}
