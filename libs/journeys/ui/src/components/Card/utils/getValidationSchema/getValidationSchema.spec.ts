import { TFunction } from 'next-i18next'

import { TextResponseType } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'

import { getValidationSchema } from './getValidationSchema'

type MockBlock = Partial<TreeBlock> & {
  id: string
  __typename: string
  children: MockBlock[]
  required?: boolean
  type?: TextResponseType
}

// Helper to cast our simplified mock blocks to TreeBlock
const asTreeBlocks = (blocks: MockBlock[]): TreeBlock[] =>
  blocks as unknown as TreeBlock[]

const mockT = ((key: string): string => key) as TFunction

describe('getValidationSchema', () => {
  it('should add required validation when block.required is true', async () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'text1',
        __typename: 'TextResponseBlock',
        required: true,
        children: []
      }
    ])

    const schema = getValidationSchema(mockBlocks, mockT)

    await expect(schema.validate({ text1: '' })).rejects.toThrow(
      'This field is required'
    )
  })

  it('should add name validation for TextResponseType.name', async () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'text1',
        __typename: 'TextResponseBlock',
        type: TextResponseType.name,
        children: []
      }
    ])

    const schema = getValidationSchema(mockBlocks, mockT)

    await expect(schema.validate({ text1: 'a' })).rejects.toThrow(
      'Name must be 2 characters or more'
    )

    const longName = 'a'.repeat(51)
    await expect(schema.validate({ text1: longName })).rejects.toThrow(
      'Name must be 50 characters or less'
    )

    await expect(schema.validate({ text1: 'John' })).resolves.not.toThrow()
  })

  it('should add email validation for TextResponseType.email', async () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'text1',
        __typename: 'TextResponseBlock',
        type: TextResponseType.email,
        children: []
      }
    ])

    const schema = getValidationSchema(mockBlocks, mockT)

    await expect(schema.validate({ text1: 'invalid-email' })).rejects.toThrow(
      'Please enter a valid email address'
    )

    await expect(
      schema.validate({ text1: 'test@example.com' })
    ).resolves.not.toThrow()
  })

  it('should return an empty schema if no TextResponseBlock blocks are found', () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'card1',
        __typename: 'CardBlock',
        children: []
      },
      {
        id: 'button1',
        __typename: 'ButtonBlock',
        children: []
      }
    ])

    const schema = getValidationSchema(mockBlocks, mockT)

    const schemaDescription = schema.describe()
    expect(Object.keys(schemaDescription.fields).length).toBe(0)
  })

  it('should not enforce multiselect when min is null or 0', async () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'multi1',
        __typename: 'MultiselectBlock',
        min: null,
        children: []
      },
      {
        id: 'multi2',
        __typename: 'MultiselectBlock',
        min: 0,
        children: []
      }
    ])

    const schema = getValidationSchema(mockBlocks, mockT)

    await expect(
      schema.validate({ multi1: [], multi2: [] })
    ).resolves.not.toThrow()
  })

  it('should enforce multiselect min when min > 0', async () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'multi',
        __typename: 'MultiselectBlock',
        min: 2,
        children: []
      }
    ])

    const schema = getValidationSchema(mockBlocks, mockT)

    await expect(schema.validate({ multi: [] })).rejects.toThrow(
      'Select at least {{count}} options.'
    )
    await expect(schema.validate({ multi: ['A'] })).rejects.toThrow(
      'Select at least {{count}} options.'
    )
    await expect(schema.validate({ multi: ['A', 'B'] })).resolves.not.toThrow()
  })

  it('should enforce multiselect max when max > 0', async () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'multi',
        __typename: 'MultiselectBlock',
        min: null,
        max: 2,
        children: []
      }
    ])

    const schema = getValidationSchema(mockBlocks, mockT)

    await expect(schema.validate({ multi: ['A', 'B', 'C'] })).rejects.toThrow(
      'Select up to {{count}} options.'
    )
    await expect(schema.validate({ multi: ['A'] })).resolves.not.toThrow()
    await expect(schema.validate({ multi: ['A', 'B'] })).resolves.not.toThrow()
  })

  it('should enforce both min and max when both provided', async () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'multi',
        __typename: 'MultiselectBlock',
        min: 2,
        max: 3,
        children: []
      }
    ])

    const schema = getValidationSchema(mockBlocks, mockT)

    await expect(schema.validate({ multi: ['A'] })).rejects.toThrow(
      'Select at least {{count}} options.'
    )
    await expect(
      schema.validate({ multi: ['A', 'B', 'C', 'D'] })
    ).rejects.toThrow('Select up to {{count}} options.')
    await expect(schema.validate({ multi: ['A', 'B'] })).resolves.not.toThrow()
    await expect(
      schema.validate({ multi: ['A', 'B', 'C'] })
    ).resolves.not.toThrow()
  })
})
