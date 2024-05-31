import { TreeBlock } from '../block'
import { BlockFields } from '../block/__generated__/BlockFields'

import { isActionBlock } from '.'

describe('isActionBlock', () => {
  it('should return true for valid action block', () => {
    const block = { action: 'action' } as unknown as TreeBlock<BlockFields>
    expect(isActionBlock(block)).toBe(true)
  })

  it('should return false for a non-action block', () => {
    const block = { text: 'some text' } as unknown as TreeBlock<BlockFields>
    expect(isActionBlock(block)).toBe(false)
  })

  it('should return false for an empty block', () => {
    const block = {} as unknown as TreeBlock<BlockFields>
    expect(isActionBlock(block)).toBe(false)
  })
})
