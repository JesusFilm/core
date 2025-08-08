import { parseCustomizationFieldsFromString } from './parseCustomizationFieldsFromString'

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
        defaultValue: 'John'
      })
      expect(result[0].id).toBeDefined()
    })

    it('should handle keys without values', () => {
      const input = 'Hello {{ name }}!'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        journeyId: mockJourneyId,
        key: 'name',
        value: null,
        defaultValue: null
      })
      expect(result[0].id).toBeDefined()
    })

    it('should handle keys with empty string values', () => {
      const input = '{{ title: Welcome }} {{ description: "" }} {{ bio: \'\' }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Welcome',
        defaultValue: 'Welcome'
      })
      expect(result[1]).toMatchObject({
        key: 'description',
        value: null,
        defaultValue: null
      })
      expect(result[2]).toMatchObject({
        key: 'bio',
        value: null,
        defaultValue: null
      })
    })

    it('should handle keys with quoted values', () => {
      const input =
        '{{ title: "Hello World" }} {{ name: \'John Doe\' }} {{ message: "Hello there!" }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Hello World',
        defaultValue: 'Hello World'
      })
      expect(result[1]).toMatchObject({
        key: 'name',
        value: 'John Doe',
        defaultValue: 'John Doe'
      })
      expect(result[2]).toMatchObject({
        key: 'message',
        value: 'Hello there!',
        defaultValue: 'Hello there!'
      })
    })

    it('should handle keys with colon but no value', () => {
      const input = '{{ title: Welcome }} {{ description: }} {{ bio: }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Welcome',
        defaultValue: 'Welcome'
      })
      expect(result[1]).toMatchObject({
        key: 'description',
        value: null,
        defaultValue: null
      })
      expect(result[2]).toMatchObject({
        key: 'bio',
        value: null,
        defaultValue: null
      })
    })

    it('should handle keys with whitespace around quoted values', () => {
      const input =
        'this title says hello world: {{ title:  "Hello World"  }} \n\n\n this is the name: {{ name:  \'John Doe\'  }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Hello World',
        defaultValue: 'Hello World'
      })
      expect(result[1]).toMatchObject({
        key: 'name',
        value: 'John Doe',
        defaultValue: 'John Doe'
      })
    })

    it('should handle mixed patterns with all variations', () => {
      const input =
        '{{ key }} {{ some_key: "" }} {{ some_key: }} {{ some_key: "some value" }} {{ some_key_with_underscores }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(5)
      expect(result[0]).toMatchObject({
        key: 'key',
        value: null,
        defaultValue: null
      })
      expect(result[1]).toMatchObject({
        key: 'some_key',
        value: null,
        defaultValue: null
      })
      expect(result[2]).toMatchObject({
        key: 'some_key',
        value: null,
        defaultValue: null
      })
      expect(result[3]).toMatchObject({
        key: 'some_key',
        value: 'some value',
        defaultValue: 'some value'
      })
      expect(result[4]).toMatchObject({
        key: 'some_key_with_underscores',
        value: null,
        defaultValue: null
      })
    })

    it('should handle multiple fields in one string', () => {
      const input = '{{ title: Welcome }} {{ description: Hello World }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Welcome',
        defaultValue: 'Welcome'
      })
      expect(result[1]).toMatchObject({
        key: 'description',
        value: 'Hello World',
        defaultValue: 'Hello World'
      })
    })

    it('should handle mixed fields with and without values', () => {
      const input =
        'this is the title: {{ title: Welcome }} \n this is the description: {{ description }} \n this is the author: {{ author: John Doe }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Welcome',
        defaultValue: 'Welcome'
      })
      expect(result[1]).toMatchObject({
        key: 'description',
        value: null,
        defaultValue: null
      })
      expect(result[2]).toMatchObject({
        key: 'author',
        value: 'John Doe',
        defaultValue: 'John Doe'
      })
    })

    it('should handle keys with underscores', () => {
      const input = '{{ user_name: John Doe }} {{ company_name: Acme Corp }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'user_name',
        value: 'John Doe',
        defaultValue: 'John Doe'
      })
      expect(result[1]).toMatchObject({
        key: 'company_name',
        value: 'Acme Corp',
        defaultValue: 'Acme Corp'
      })
    })

    it('should handle keys with underscores without values', () => {
      const input = '{{ user_name }} {{ company_name }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'user_name',
        value: null,
        defaultValue: null
      })
      expect(result[1]).toMatchObject({
        key: 'company_name',
        value: null,
        defaultValue: null
      })
    })

    it('should handle empty string values', () => {
      const input = '{{ title: Welcome }} {{ description: }} {{ website: }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(3)
      expect(result[0]).toMatchObject({
        key: 'title',
        value: 'Welcome',
        defaultValue: 'Welcome'
      })
      expect(result[1]).toMatchObject({
        key: 'description',
        value: null,
        defaultValue: null
      })
      expect(result[2]).toMatchObject({
        key: 'website',
        value: null,
        defaultValue: null
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
        defaultValue: 'value'
      })
      expect(result[1]).toMatchObject({
        key: 'another_key',
        value: 'another_value',
        defaultValue: 'another_value'
      })
    })

    it('should handle whitespace around keys without values', () => {
      const input = '{{  key  }} {{  another_key  }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'key',
        value: null,
        defaultValue: null
      })
      expect(result[1]).toMatchObject({
        key: 'another_key',
        value: null,
        defaultValue: null
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

    it('should generate unique IDs for fields without values', () => {
      const input = '{{ field1 }} {{ field2 }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBeDefined()
      expect(result[1].id).toBeDefined()
      expect(result[0].id).not.toBe(result[1].id)
    })

    it('should handle complex mixed scenarios', () => {
      const input =
        '{{ user_first_name: John }} {{ user_last_name }} {{ profile_url: https://example.com/profile }} {{ bio }}'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(4)
      expect(result[0]).toMatchObject({
        key: 'user_first_name',
        value: 'John',
        defaultValue: 'John'
      })
      expect(result[1]).toMatchObject({
        key: 'user_last_name',
        value: null,
        defaultValue: null
      })
      expect(result[2]).toMatchObject({
        key: 'profile_url',
        value: 'https://example.com/profile',
        defaultValue: 'https://example.com/profile'
      })
      expect(result[3]).toMatchObject({
        key: 'bio',
        value: null,
        defaultValue: null
      })
    })

    it('should handle mixed content with text', () => {
      const input =
        'Welcome {{ name: John }}! Visit {{ website: https://example.com }} for more info.'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'name',
        value: 'John',
        defaultValue: 'John'
      })
      expect(result[1]).toMatchObject({
        key: 'website',
        value: 'https://example.com',
        defaultValue: 'https://example.com'
      })
    })

    it('should handle mixed content with fields without values', () => {
      const input = 'Welcome {{ name }}! Visit {{ website }} for more info.'
      const result = parseCustomizationFieldsFromString(input, mockJourneyId)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        key: 'name',
        value: null,
        defaultValue: null
      })
      expect(result[1]).toMatchObject({
        key: 'website',
        value: null,
        defaultValue: null
      })
    })
  })
})
