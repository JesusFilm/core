import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../libs/JourneyProvider/__generated__/JourneyFields'

/**
 * Resolves all occurrences of customization templates within a string.
 * Supports only the "{{ key }}" syntax (no inline value support).
 * - For each custom field: returns field.value ?? field.defaultValue if key exists; otherwise keeps the custom field.
 * - Multiple custom fields and repeated keys are supported in one pass.
 */
export function resolveJourneyCustomizationString(
  input: string | null,
  journeyCustomizationFields: JourneyCustomizationField[]
): string | null {
  if (input == null) return null

  const customFieldsPattern = /\{\{\s*([^:}]+)\s*\}\}/g

  const replaced = input.replace(customFieldsPattern, (fullMatch, key) => {
    const trimmedKey = String(key).trim()
    const field = journeyCustomizationFields.find((f) => f.key === trimmedKey)
    const resolved = field?.value ?? field?.defaultValue
    return resolved ?? fullMatch
  })

  return replaced
}
