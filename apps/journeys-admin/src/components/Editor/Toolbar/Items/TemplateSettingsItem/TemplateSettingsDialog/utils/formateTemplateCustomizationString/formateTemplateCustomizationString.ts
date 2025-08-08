export function formateTemplateCustomizationString(
  templateCustomizationFields: string[],
  customizationText?: string
): string {
  // Early return for edge cases
  if (!templateCustomizationFields.length) {
    return ''
  }

  // Handle null/undefined customizationText by treating it as empty string
  const text = customizationText || ''

  // More robust regex pattern that handles edge cases better
  const keyValuePattern = /\{\{([^:]+?):\s*([^}]*?)\}\}/g

  // Extract all keys from the customization text more efficiently
  const foundKeys = new Set<string>()
  let match

  while ((match = keyValuePattern.exec(text)) !== null) {
    const key = match[1].trim()
    if (key) {
      foundKeys.add(key)
    }
  }

  const missingKeys = templateCustomizationFields.filter(
    (key) => !foundKeys.has(key)
  )

  // Build the result more efficiently
  const missingKeysText = missingKeys.map((key) => `{{${key}: }}`).join('\n')

  // If no missing keys and text is empty, return empty string
  if (missingKeys.length === 0 && !text) {
    return ''
  }

  // If no missing keys but text exists, return just the text
  if (missingKeys.length === 0) {
    return text
  }

  // If text is empty, return just the missing keys
  if (!text) {
    return missingKeysText
  }

  // Otherwise, return text + missing keys
  return `${text}\n${missingKeysText}`
}
