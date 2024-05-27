import { isActionBlock } from '.'

describe('isActionBlock', () => {
  it('should return true for valid action block', () => {
    const block = { action: 'action' }
    expect(isActionBlock(block)).toBe(true)
  })

  it('should return false for a non-action block', () => {
    const block = { text: 'some text' }
    expect(isActionBlock(block)).toBe(false)
  })

  it('should return false for an empty block', () => {
    const block = {}
    expect(isActionBlock(block)).toBe(false)
  })

  it('should return false for null', () => {
    const block = null
    expect(isActionBlock(block)).toBe(false)
  })

  it('should return false for undefined', () => {
    const block = undefined
    expect(isActionBlock(block)).toBe(false)
  })
})
