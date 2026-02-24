import { TreeBlock } from '../../../../libs/block'

import { getFormInitialValues } from './getFormInitialValues'

type MockBlock = {
  id: string
  __typename: string
  parentBlockId?: string | null
  parentOrder?: number | null
  children: MockBlock[]
  // Add other optional fields that might be needed
  min?: number | null
  max?: number | null
}

// Helper to cast the simplified mock blocks to TreeBlock
const asTreeBlocks = (blocks: MockBlock[]): TreeBlock[] =>
  blocks as unknown as TreeBlock[]

describe('getFormInitialValues', () => {
  it('should return an object with text response block ids as keys and empty strings as values', () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'card1',
        __typename: 'CardBlock',
        children: []
      },
      {
        id: 'text1',
        __typename: 'TextResponseBlock',
        children: []
      },
      {
        id: 'text2',
        __typename: 'TextResponseBlock',
        children: []
      },
      {
        id: 'button1',
        __typename: 'ButtonBlock',
        children: []
      }
    ])

    const result = getFormInitialValues(mockBlocks)

    expect(result).toEqual({
      text1: '',
      text2: ''
    })
  })

  it('should return an empty object if no text response blocks are found', () => {
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

    const result = getFormInitialValues(mockBlocks)

    expect(result).toEqual({})
  })

  it('should include multiselect blocks with empty arrays', () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'card1',
        __typename: 'CardBlock',
        children: []
      },
      {
        id: 'multi1',
        __typename: 'MultiselectBlock',
        children: [
          {
            id: 'option1',
            __typename: 'MultiselectOptionBlock',
            children: []
          }
        ]
      },
      {
        id: 'multi2',
        __typename: 'MultiselectBlock',
        children: []
      }
    ])

    const result = getFormInitialValues(mockBlocks)

    expect(result).toEqual({
      multi1: [],
      multi2: []
    })
  })
})
