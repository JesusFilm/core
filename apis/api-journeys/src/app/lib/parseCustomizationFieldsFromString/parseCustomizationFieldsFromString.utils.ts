import { v4 as uuidv4 } from 'uuid'

import { JourneyCustomizationField } from '.prisma/api-journeys-client'

/**
 * Transforms a string containing customization field syntax into an array of CustomizationFieldData objects
 * @param inputString - The string to parse for {{ key: value }} and {{ key }} patterns
 * @param journeyId - The ID of the journey these fields belong to
 * @returns Array of CustomizationFieldData objects ready for Prisma createMany
 *
 * Supports:
 * - Keys with values (e.g., {{ user_name: John }})
 * - Keys without values (e.g., {{ user_name }})
 * - Keys with empty string values (e.g., {{ description: '' }})
 * - Keys with quoted values (e.g., {{ title: 'Hello World' }})
 * - Keys with colon but no value (e.g., {{ description: }})
 * - Keys with underscores
 */
export function parseCustomizationFieldsFromString(
  inputString: string,
  journeyId: string
): JourneyCustomizationField[] {
  const fields: JourneyCustomizationField[] = []

  // Regex pattern to match both {{ key: value }} and {{ key }} syntax
  // Handles quoted values, empty strings, and whitespace
  const pattern =
    /\{\{\s*([^:}]+)(?:\s*:\s*(?:(['"])([^'"]*)\2|([^}]*?)))?\s*\}\}/g

  for (const match of inputString.matchAll(pattern)) {
    const key = match[1].trim()
    const quotedValue = match[3]
    const unquotedValue = match[4]
    const value =
      quotedValue !== undefined
        ? quotedValue
        : unquotedValue !== undefined
          ? unquotedValue.trim()
          : null

    fields.push({
      id: uuidv4(),
      journeyId,
      value: value || null,
      key,
      defaultValue: value || null
    })
  }

  return fields
}
