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

  const trimmed = input.trim()

  const pattern =
    /^\{\{\s*([^:}]+)(?:\s*:\s*(?:(['"])([^'"]*)\2|([^}]*?)))?\s*\}\}$/

  const match = trimmed.match(pattern)
  if (match == null) return input

  const key = match[1].trim()
  const field = journeyCustomizationFields.find((f) => f.key === key)
  if (field == null) return input

  const resolved = field.value ?? field.defaultValue
  return resolved ?? input
}
