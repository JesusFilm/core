/**
 * Formats template customization string by ensuring all required template fields are present.
 *
 * This function processes a customization text that may contain parameterized placeholders
 * in the format `{{key: value}}`. It compares the keys found in the text against a provided
 * array of required template fields. If any required fields are missing from the text,
 * they are appended at the bottom with empty values.
 *
 * @param templateCustomizationFields - Array of required template field keys that should be present in the text
 * @param customizationText - Optional text containing parameterized placeholders in format `{{key: value}}`
 *
 * @returns Formatted string with all required template fields. If no template fields are provided,
 *          returns empty string. If text is null/undefined, treats it as empty string.
 *
 * @example
 * ```typescript
 * // Basic usage with existing text
 * formateTemplateCustomizationString(
 *   ['name', 'email', 'company'],
 *   'Hello {{name: John}}, your email is {{email: john@example.com}}'
 * )
 * // Returns: "Hello {{name: John}}, your email is {{email: john@example.com}}\n{{company: }}"
 *
 * // With null text
 * formateTemplateCustomizationString(['name', 'email'], null)
 * // Returns: "{{name: }}\n{{email: }}"
 *
 * // With empty text
 * formateTemplateCustomizationString(['name', 'email'], '')
 * // Returns: "{{name: }}\n{{email: }}"
 *
 * // All fields already present
 * formateTemplateCustomizationString(
 *   ['name', 'email'],
 *   'Hello {{name: John}} {{email: john@example.com}}'
 * )
 * // Returns: "Hello {{name: John}} {{email: john@example.com}}"
 *
 * // Empty template fields
 * formateTemplateCustomizationString([], 'some text')
 * // Returns: ""
 * ```
 */
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
