import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../libs/JourneyProvider/__generated__/JourneyFields'

/**
 * Resolves a string that may strictly equal a customization template of the form
 * "{{ key }}" or "{{ key: value }}" against provided journey customization fields.
 * - Requires the entire string (after trim) to match the pattern.
 * - If key is found, returns field.value ?? field.defaultValue.
 * - If no match, key not found, or no resolved value, returns the original input.
 */
export function resolveJourneyCustomizationString(
  input: string | null,
  journeyCustomizationFields: JourneyCustomizationField[]
): string | null {
  if (input == null) return null

  const customFieldsPattern =
    /\{\{\s*([^:}]+)(?:\s*:\s*(?:(['"])([^'"]*)\2|([^}]*?)))?\s*\}\}/g

  const replaced = input.replace(customFieldsPattern, (fullMatch, key) => {
    const trimmedKey = String(key).trim()
    const field = journeyCustomizationFields.find((f) => f.key === trimmedKey)
    const resolved = field?.value ?? field?.defaultValue
    return resolved ?? fullMatch
  })

  return replaced
}
