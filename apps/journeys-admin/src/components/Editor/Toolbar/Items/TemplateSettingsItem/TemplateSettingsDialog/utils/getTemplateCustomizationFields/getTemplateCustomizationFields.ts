import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

/**
 * Extracts all template customization fields from a journey object.
 *
 * This function traverses through a journey object and extracts all template strings
 * that are enclosed in double curly braces `{{templateString}}`. It searches through
 * various journey properties including title, description, SEO fields, user information,
 * and block content to find all template placeholders.
 *
 * The function handles different block types and extracts template strings from their
 * relevant text fields. It uses a Set to ensure unique template field names are returned.
 *
 * @param journey - Optional journey object containing various text fields and blocks
 *                  that may contain template strings
 *
 * @returns Array of unique template field names found in the journey. Returns empty
 *          array if journey is null/undefined or no template strings are found.
 *
 * @example
 * ```typescript
 * // Journey with template strings in various fields
 * const journey = {
 *   title: 'Welcome {{userName}}',
 *   description: 'Your journey to {{goal}}',
 *   blocks: [
 *     {
 *       __typename: 'TypographyBlock',
 *       content: 'Hello {{firstName}} {{lastName}}'
 *     },
 *     {
 *       __typename: 'ButtonBlock',
 *       label: 'Continue to {{nextStep}}'
 *     }
 *   ]
 * }
 *
 * getTemplateCustomizationFields(journey)
 * // Returns: ['userName', 'goal', 'firstName', 'lastName', 'nextStep']
 *
 * // Journey with no template strings
 * const simpleJourney = {
 *   title: 'Simple Journey',
 *   description: 'No templates here'
 * }
 *
 * getTemplateCustomizationFields(simpleJourney)
 * // Returns: []
 *
 * // Null journey
 * getTemplateCustomizationFields(null)
 * // Returns: []
 *
 * // Undefined journey
 * getTemplateCustomizationFields(undefined)
 * // Returns: []
 * ```
 */
export function getTemplateCustomizationFields(journey?: Journey): string[] {
  const templateStrings = new Set<string>()
  if (journey == null) return []

  // Helper function to extract template strings from text
  const extractTemplateStrings = (text: string | null | undefined): void => {
    if (text == null || text === '') return
    const regex = /\{\{\s*([^}]+?)\s*\}\}/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      const keyName = match[1].trim()
      if (keyName !== '') templateStrings.add(keyName)
    }
  }

  // Extract from journey-level text fields
  extractTemplateStrings(journey.title)
  extractTemplateStrings(journey.description)
  extractTemplateStrings(journey.seoTitle)
  extractTemplateStrings(journey.seoDescription)
  extractTemplateStrings(journey.creatorDescription)
  extractTemplateStrings(journey.displayTitle)
  extractTemplateStrings(journey.slug)
  extractTemplateStrings(journey.strategySlug)

  // Extract from user journeys
  if (journey.userJourneys) {
    journey.userJourneys.forEach((userJourney) => {
      if (userJourney.user) {
        extractTemplateStrings(userJourney.user.firstName)
        extractTemplateStrings(userJourney.user.lastName)
        extractTemplateStrings(userJourney.user.imageUrl)
      }
    })
  }

  // Flatten and extract from blocks
  if (journey.blocks) {
    journey.blocks.forEach((block) => {
      switch (block.__typename) {
        case 'TypographyBlock':
          extractTemplateStrings(block.content)
          break
        case 'ButtonBlock':
          extractTemplateStrings(block.label)
          break
        case 'TextResponseBlock':
          extractTemplateStrings(block.label)
          extractTemplateStrings(block.placeholder)
          extractTemplateStrings(block.hint)
          break
        case 'RadioOptionBlock':
          extractTemplateStrings(block.label)
          break
        case 'SignUpBlock':
          extractTemplateStrings(block.submitLabel)
          break
        case 'IconBlock':
          extractTemplateStrings(block.iconName)
          break
        default:
          break
      }
    })
  }

  return Array.from(templateStrings)
}
