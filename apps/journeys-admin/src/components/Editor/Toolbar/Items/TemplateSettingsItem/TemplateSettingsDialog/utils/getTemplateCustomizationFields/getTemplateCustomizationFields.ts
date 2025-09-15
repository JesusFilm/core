import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

/**
 * Extracts template customization field names from a journey's blocks.
 *
 * Searches block text properties for occurrences of `{{ templateKey }}` and returns
 * a de-duplicated array of the keys found. Journey-level properties (e.g. title,
 * description, SEO fields, slugs) and `userJourneys` are intentionally ignored.
 *
 * Searched block properties:
 * - TypographyBlock: content
 * - ButtonBlock: label
 * - TextResponseBlock: label, placeholder, hint
 * - RadioOptionBlock: label
 * - SignUpBlock: submitLabel
 *
 * @param journey Optional journey whose blocks may contain template strings.
 * @returns Array of unique template field names. Returns [] when none are found
 *          or when `journey` is null/undefined.
 *
 * @example
 * ```ts
 * const journey = {
 *   blocks: [
 *     { __typename: 'TypographyBlock', content: 'Hello {{firstName}}' },
 *     { __typename: 'ButtonBlock', label: 'Go to {{nextStep}}' }
 *   ]
 * }
 * getTemplateCustomizationFields(journey) // ['firstName', 'nextStep']
 * ```
 *
 * @example
 * ```ts
 * getTemplateCustomizationFields(undefined) // []
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
        default:
          break
      }
    })
  }

  return Array.from(templateStrings)
}
