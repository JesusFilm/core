import { JourneyCustomizationFieldType } from '../../__generated__/graphql'

import { parseCustomizationFieldsFromString } from './parseCustomizationFieldsFromString.utils'

describe('parseCustomizationFieldsFromString Utils', () => {
  describe('parseCustomizationFieldsFromString', () => {
    const mockJourneyId = 'journey-123'

    it('should parse basic customization fields', () => {
      const input = 'Hello {{ name: John }}!'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        journeyId: mockJourneyId,
        key: 'name',
        value: 'John',
        defaultValue: 'John',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[0].id).toBeDefined()
    })

    it('should handle multiple fields in one string', () => {
      const input = '{{ title: Welcome }} {{ description: Hello World }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Welcome',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[1]).toMatchObject({
        key: 'description',
        value: 'Hello World',
        fieldType: JourneyCustomizationFieldType.text
      })
    })

    it('should handle keys with underscores', () => {
      const input = '{{ user_name: John Doe }} {{ company_name: Acme Corp }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'user_name',
        value: 'John Doe',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[1]).toMatchObject({
        key: 'company_name',
        value: 'Acme Corp',
        fieldType: JourneyCustomizationFieldType.text
      })
    })

    it('should handle empty string values', () => {
      const input = '{{ title: Welcome }} {{ description: }} {{ website: }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Welcome',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[1]).toMatchObject({
        key: 'description',
        value: null,
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[2]).toMatchObject({
        key: 'website',
        value: null,
        fieldType: JourneyCustomizationFieldType.text
      })
    })

    it('should detect URLs and set fieldType to link', () => {
      const input =
        '{{ website: https://example.com }} {{ profile: www.profile.com }} {{ name: John }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        key: 'website',
        value: 'https://example.com',
        fieldType: JourneyCustomizationFieldType.link
      })
      expect(result[1]).toMatchObject({
        key: 'profile',
        value: 'www.profile.com',
        fieldType: JourneyCustomizationFieldType.link
      })
      expect(result[2]).toMatchObject({
        key: 'name',
        value: 'John',
        fieldType: JourneyCustomizationFieldType.text
      })
    })

    it('should handle whitespace around keys and values', () => {
      const input =
        '{{  key  :  value  }} {{  another_key  :  another_value  }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'key',
        value: 'value',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[1]).toMatchObject({
        key: 'another_key',
        value: 'another_value',
        fieldType: JourneyCustomizationFieldType.text
      })
    })

    it('should return empty array for string without customization fields', () => {
      const input = 'This is a regular string without any customization fields'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(0)
    })

    it('should generate unique IDs for each field', () => {
      const input = '{{ field1: value1 }} {{ field2: value2 }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBeDefined()
      expect(result[1].id).toBeDefined()
      expect(result[0].id).not.toBe(result[1].id)
    })

    it('should handle complex mixed scenarios', () => {
      const input =
        '{{ user_first_name: John }} {{ user_last_name: }} {{ profile_url: https://example.com/profile }} {{ bio: }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(4)
      expect(result[0]).toMatchObject({
        key: 'user_first_name',
        value: 'John',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[1]).toMatchObject({
        key: 'user_last_name',
        value: null,
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[2]).toMatchObject({
        key: 'profile_url',
        value: 'https://example.com/profile',
        fieldType: JourneyCustomizationFieldType.link
      })
      expect(result[3]).toMatchObject({
        key: 'bio',
        value: null,
        fieldType: JourneyCustomizationFieldType.text
      })
    })

    it('should handle special characters in keys', () => {
      const input =
        '{{ user-name: John }} {{ user.name: Doe }} {{ user_name: Smith }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        key: 'user-name',
        value: 'John',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[1]).toMatchObject({
        key: 'user.name',
        value: 'Doe',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[2]).toMatchObject({
        key: 'user_name',
        value: 'Smith',
        fieldType: JourneyCustomizationFieldType.text
      })
    })

    it('should handle URLs with query parameters', () => {
      const input =
        '{{ profile: https://example.com/profile?user=123&tab=settings }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        key: 'profile',
        value: 'https://example.com/profile?user=123&tab=settings',
        fieldType: JourneyCustomizationFieldType.link
      })
    })

    it('should handle URLs with fragments', () => {
      const input = '{{ docs: https://example.com/docs#section1 }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        key: 'docs',
        value: 'https://example.com/docs#section1',
        fieldType: JourneyCustomizationFieldType.link
      })
    })

    it('should handle mixed content with URLs and text', () => {
      const input =
        'Welcome {{ name: John }}! Visit {{ website: https://example.com }} for more info.'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'name',
        value: 'John',
        fieldType: JourneyCustomizationFieldType.text
      })
      expect(result[1]).toMatchObject({
        key: 'website',
        value: 'https://example.com',
        fieldType: JourneyCustomizationFieldType.link
      })
    })
  })
})
