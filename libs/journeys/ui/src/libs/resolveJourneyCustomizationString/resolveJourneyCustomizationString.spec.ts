import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { resolveJourneyCustomizationString } from './resolveJourneyCustomizationString'

describe('resolveJourneyCustomizationString', () => {
  const fields = [
    { key: 'name', value: 'Alice', defaultValue: 'Anonymous' },
    { key: 'title', value: null, defaultValue: 'Child of God' },
    { key: 'empty', value: null, defaultValue: null },
    { key: 'some', value: 'Some Value', defaultValue: 'Some Default' }
  ] as JourneyCustomizationField[]

  it('returns null when input is null', () => {
    expect(resolveJourneyCustomizationString(null, fields)).toBeNull()
  })

  it('replaces custom fields within mixed strings and leaves non-token text intact', () => {
    expect(resolveJourneyCustomizationString('Hello {{ name }}!', fields)).toBe(
      'Hello Alice!'
    )
    expect(resolveJourneyCustomizationString('name', fields)).toBe('name')
    expect(resolveJourneyCustomizationString('{{name}} extra', fields)).toBe(
      'Alice extra'
    )
  })

  it('resolves key-only pattern to the field value when present', () => {
    expect(resolveJourneyCustomizationString('{{ name }}', fields)).toBe(
      'Alice'
    )
  })

  it('resolves key-only pattern to the defaultValue when value is null', () => {
    expect(resolveJourneyCustomizationString('{{ title }}', fields)).toBe(
      'Child of God'
    )
  })

  it('falls back to original input when neither value nor defaultValue is present', () => {
    expect(resolveJourneyCustomizationString('{{ empty }}', fields)).toBe(
      '{{ empty }}'
    )
  })

  it('does not support inline values; leaves tokens with colon unchanged (quoted)', () => {
    expect(
      resolveJourneyCustomizationString("{{ name: 'Knee Sail' }}", fields)
    ).toBe("{{ name: 'Knee Sail' }}")
    expect(
      resolveJourneyCustomizationString(
        '{{ title: "Some Random Title" }}',
        fields
      )
    ).toBe('{{ title: "Some Random Title" }}')
  })

  it('does not support inline values; leaves tokens with colon unchanged (unquoted)', () => {
    expect(resolveJourneyCustomizationString('{{ some: value }}', fields)).toBe(
      '{{ some: value }}'
    )
  })

  it('replaces key-only custom fields regardless of surrounding whitespace', () => {
    expect(resolveJourneyCustomizationString('  {{ name }}  ', fields)).toBe(
      '  Alice  '
    )
    expect(
      resolveJourneyCustomizationString('  {{ title:  Some Title  }}', fields)
    ).toBe('  {{ title:  Some Title  }}')
  })

  it('trims spaces around the key before lookup', () => {
    expect(resolveJourneyCustomizationString('{{   name   }}', fields)).toBe(
      'Alice'
    )
  })

  it('returns original input when no field key matches', () => {
    expect(resolveJourneyCustomizationString('{{ unknown }}', fields)).toBe(
      '{{ unknown }}'
    )
  })
})
