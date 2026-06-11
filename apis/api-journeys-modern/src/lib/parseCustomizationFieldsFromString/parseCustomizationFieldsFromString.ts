import { v4 as uuidv4 } from 'uuid'

import { JourneyCustomizationField } from '@core/prisma/journeys/client'

export function parseCustomizationFieldsFromString(
  inputString: string,
  journeyId: string
): JourneyCustomizationField[] {
  const fields: JourneyCustomizationField[] = []

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
