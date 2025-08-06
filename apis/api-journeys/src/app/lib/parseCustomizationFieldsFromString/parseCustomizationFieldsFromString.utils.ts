import { v4 as uuidv4 } from 'uuid'

import { JourneyCustomizationField } from '.prisma/api-journeys-client'

import { JourneyCustomizationFieldType } from '../../__generated__/graphql'

/**
 * Transforms a string containing customization field syntax into an array of CustomizationFieldData objects
 * @param inputString - The string to parse for {{ key: value }} patterns
 * @param journeyId - The ID of the journey these fields belong to
 * @returns Array of CustomizationFieldData objects ready for Prisma createMany
 *
 * Supports:
 * - Keys with underscores (e.g., {{ user_name: John }})
 * - Empty string values (e.g., {{ description: }})
 * - URL detection for automatic field type assignment
 */
export function parseCustomizationFieldsFromString(
  inputString: string,
  journeyId: string
): JourneyCustomizationField[] {
  const fields: JourneyCustomizationField[] = []

  // Regex pattern to match {{ key: value }} syntax
  // Allows empty values, underscores in keys, and handles whitespace
  const pattern = /\{\{\s*([^:]+)\s*:\s*([^}]*?)\s*\}\}/g

  for (const match of inputString.matchAll(pattern)) {
    const key = match[1].trim()
    const value = match[2].trim()

    // Determine field type based on the value
    // If value looks like a URL, use 'link', otherwise use 'text'
    const isUrl = /^https?:\/\/.+/.test(value) || /^www\./.test(value)
    const fieldType: JourneyCustomizationFieldType = isUrl
      ? JourneyCustomizationFieldType.link
      : JourneyCustomizationFieldType.text

    fields.push({
      id: uuidv4(), // Generate unique ID for each field
      journeyId,
      value: value || null, // Empty string becomes null
      key,
      defaultValue: value || null, // Set default value same as current value
      fieldType
    })
  }

  return fields
}
