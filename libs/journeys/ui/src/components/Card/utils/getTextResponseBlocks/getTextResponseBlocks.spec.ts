import { TreeBlock } from '../../../../libs/block'

import { getTextResponseBlocks } from './getTextResponseBlocks'

type MockBlock = Partial<TreeBlock> & {
  id: string
  __typename: string
  children: MockBlock[]
}

// Helper to cast our simplified mock blocks to TreeBlock
const asTreeBlocks = (blocks: MockBlock[]): TreeBlock[] =>
  blocks as unknown as TreeBlock[]

describe('getTextResponseBlocks', () => {
  it('should return all TextResponseBlock blocks from children array', () => {
    const mockBlocks = asTreeBlocks([
      {
        id: 'image1',
        __typename: 'ImageBlock',
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

    const result = getTextResponseBlocks(mockBlocks)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('text1')
    expect(result[1].id).toBe('text2')
  })

  it('should return an empty array if no TextResponseBlock blocks are found', () => {
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

    const result = getTextResponseBlocks(mockBlocks)

    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })
})
