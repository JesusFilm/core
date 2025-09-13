import { formatTemplateCustomizationString } from './formatTemplateCustomizationString'

describe('formatTemplateCustomizationString', () => {
  it('returns empty string when no template fields are provided', () => {
    const result = formatTemplateCustomizationString(
      [],
      'some text with {{name: John}}'
    )
    expect(result).toBe('')
  })

  it('returns only missing keys when customization text is not provided', () => {
    const result = formatTemplateCustomizationString(
      ['name', 'email'],
      undefined
    )
    expect(result).toBe('{{name: }}\n{{email: }}')
  })

  it('returns empty string when no template fields and no customization text are provided', () => {
    const result = formatTemplateCustomizationString([], undefined)
    expect(result).toBe('')
  })

  it('appends missing keys to the end of the provided text', () => {
    const result = formatTemplateCustomizationString(
      ['name', 'email', 'company'],
      'Hello {{name: John}}, your email is {{email: john@example.com}}'
    )
    expect(result).toBe(
      'Hello {{name: John}}, your email is {{email: john@example.com}}\n{{company: }}'
    )
  })

  it('returns original text when all required keys are already present', () => {
    const result = formatTemplateCustomizationString(
      ['name', 'email'],
      'Hello {{name: John}} {{email: john@example.com}}'
    )
    expect(result).toBe('Hello {{name: John}} {{email: john@example.com}}')
  })
})
