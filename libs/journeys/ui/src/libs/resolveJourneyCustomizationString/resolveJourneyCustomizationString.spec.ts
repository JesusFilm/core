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

  it('ignores inline value content and still resolves from fields (quoted)', () => {
    expect(
      resolveJourneyCustomizationString("{{ name: 'Knee Sail' }}", fields)
    ).toBe('Alice')
    expect(
      resolveJourneyCustomizationString(
        '{{ title: "Some Random Title" }}',
        fields
      )
    ).toBe('Child of God')
  })

  it('ignores inline value content and still resolves from fields (unquoted)', () => {
    expect(resolveJourneyCustomizationString('{{ some: value }}', fields)).toBe(
      'Some Value'
    )
  })

  it('replaces custom fields regardless of surrounding whitespace', () => {
    expect(resolveJourneyCustomizationString('  {{ name }}  ', fields)).toBe(
      '  Alice  '
    )
    expect(
      resolveJourneyCustomizationString('  {{ title:  Some Title  }}', fields)
    ).toBe('  Child of God')
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
