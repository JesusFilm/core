import { TreeBlock } from '../../../../libs/block'

import { getMultiselectBlocks } from './getMultiselectBlocks'

type MockBlock = Partial<TreeBlock> & {
  id: string
  __typename: string
  children: MockBlock[]
}

// Helper to cast our simplified mock blocks to TreeBlock
const asTreeBlocks = (blocks: MockBlock[]): TreeBlock[] =>
  blocks as unknown as TreeBlock[]

describe('getMultiselectBlocks', () => {
  it('should return all MultiselectBlock blocks from children array', () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'image1',
        __typename: 'ImageBlock',
        children: []
      },
      {
        id: 'multi1',
        __typename: 'MultiselectBlock',
        children: []
      },
      {
        id: 'multi2',
        __typename: 'MultiselectBlock',
        children: []
      },
      {
        id: 'button1',
        __typename: 'ButtonBlock',
        children: []
      }
    ])

    const result = getMultiselectBlocks(mockBlocks)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('multi1')
    expect(result[1].id).toBe('multi2')
  })

  it('should return an empty array if no MultiselectBlock blocks are found', () => {
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

    const result = getMultiselectBlocks(mockBlocks)

    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })
})
