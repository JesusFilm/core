import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../libs/JourneyProvider/__generated__/JourneyFields'

/**
 * Resolves all occurrences of customization templates within a string.
 * Supports both "{{ key }}" and "{{ key: value }}" syntax.
 * - Looks up key in journeyCustomizationFields and returns field.value ?? field.defaultValue.
 * - For "{{ key: value }}" tokens where no field exists, falls back to the inline value.
 * - For "{{ key }}" tokens where no field exists, keeps the original token.
 */
export function resolveJourneyCustomizationString(
  input: string | null,
  journeyCustomizationFields: JourneyCustomizationField[]
): string | null {
  if (input == null) return null

  const customFieldsPattern =
    /\{\{\s*([^:}]+?)(?:\s*:\s*(?:(['"])([^'"]*)\2|([^}]*?)))?\s*\}\}/g

  const replaced = input.replace(
    customFieldsPattern,
    (fullMatch, key, _quote, quotedValue, unquotedValue) => {
      const trimmedKey = String(key).trim()
      const field = journeyCustomizationFields.find((f) => f.key === trimmedKey)
      const resolved = field?.value ?? field?.defaultValue

      if (resolved != null) return resolved

      const inlineValue =
        quotedValue !== undefined
          ? quotedValue
          : unquotedValue !== undefined
            ? unquotedValue.trim()
            : undefined

      return inlineValue != null && inlineValue !== ''
        ? inlineValue
        : fullMatch
    }
  )

  return replaced
}
