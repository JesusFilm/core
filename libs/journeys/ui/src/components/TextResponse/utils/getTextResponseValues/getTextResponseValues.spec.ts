import { JourneyFields_journeyCustomizationFields as JourneyCustomizationField } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'

import {
  type TextResponseStrings,
  getTextResponseValues
} from './getTextResponseValues'

describe('getTextResponseValues', () => {
  const fields: JourneyCustomizationField[] = [
    {
      __typename: 'JourneyCustomizationField',
      id: '1',
      journeyId: 'journeyId',
      key: 'name',
      value: 'Alice',
      defaultValue: 'Anonymous'
    },
    {
      __typename: 'JourneyCustomizationField',
      id: '2',
      journeyId: 'journeyId',
      key: 'title',
      value: null,
      defaultValue: 'Child of God'
    },
    {
      __typename: 'JourneyCustomizationField',
      id: '3',
      journeyId: 'journeyId',
      key: 'empty',
      value: null,
      defaultValue: null
    },
    {
      __typename: 'JourneyCustomizationField',
      id: '4',
      journeyId: 'journeyId',
      key: 'some',
      value: 'Some Value',
      defaultValue: 'Some Default'
    }
  ]

  it('returns input strings unchanged for admin variant and journey is a template', () => {
    const input: TextResponseStrings = {
      label: '{{ name }}',
      placeholder: '{{ title }}',
      hint: '{{ some: value }}'
    }
    const journeyIsTemplate = true
    const result = getTextResponseValues(
      input,
      fields,
      'admin',
      journeyIsTemplate
    )
    expect(result).toEqual(input)
  })

  it('resolves values for default variant', () => {
    const input: TextResponseStrings = {
      label: '{{ name }}',
      placeholder: '{{ title }}',
      hint: '{{ unknown }}'
    }
    const result = getTextResponseValues(input, fields, 'default')
    expect(result.label).toBe('Alice')
    expect(result.placeholder).toBe('Child of God')
    expect(result.hint).toBe('{{ unknown }}')
  })

  it('resolves values for embed variant', () => {
    const input: TextResponseStrings = {
      label: '  {{ name }}  ',
      // incorrect syntax should return unresolved:
      placeholder: '{{ title: CTO }}',
      // incorrect syntax should return unresolved:
      hint: '{{ some: value }}'
    }
    const result = getTextResponseValues(input, fields, 'embed')
    expect(result.label).toBe('  Alice  ')
    expect(result.placeholder).toBe('{{ title: CTO }}')
    expect(result.hint).toBe('{{ some: value }}')
  })

  it('replaces custom fields within mixed strings and leaves non-custom-field text intact', () => {
    const input: TextResponseStrings = {
      label: 'Hello {{ name }}!',
      placeholder: 'name',
      hint: '{{name}} extra'
    }
    const result = getTextResponseValues(input, fields, 'default')
    expect(result.label).toBe('Hello Alice!')
    expect(result.placeholder).toBe('name')
    expect(result.hint).toBe('Alice extra')
  })

  it('handles null placeholder and hint', () => {
    const input: TextResponseStrings = {
      label: '{{ unknown }}',
      placeholder: null,
      hint: null
    }
    const result = getTextResponseValues(input, fields, 'default')
    expect(result.label).toBe('{{ unknown }}')
    expect(result.placeholder).toBeNull()
    expect(result.hint).toBeNull()
  })

  it('keeps label as original when resolved value is null (no value nor defaultValue)', () => {
    const input: TextResponseStrings = {
      label: '{{ empty }}',
      placeholder: null,
      hint: null
    }
    const result = getTextResponseValues(input, fields, 'default')
    expect(result.label).toBe('{{ empty }}')
  })
})
