import { extractBlockContexts } from './extractBlockContexts'

// Mock the extractBlockContext function
jest.mock('../../../../components/AiChat/utils/contextExtraction', () => ({
  extractBlockContext: jest.fn()
}))

import { extractBlockContext } from '../../../../components/AiChat/utils/contextExtraction'

const mockExtractBlockContext = extractBlockContext as jest.MockedFunction<
  typeof extractBlockContext
>

describe('extractBlockContexts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should extract block contexts from tree blocks', () => {
    const treeBlocks = [
      { id: 'block-1', type: 'text' },
      { id: 'block-2', type: 'image' }
    ] as any[]

    mockExtractBlockContext
      .mockReturnValueOnce('Extracted context 1')
      .mockReturnValueOnce('Extracted context 2')

    const result = extractBlockContexts(treeBlocks)

    expect(result).toEqual([
      { blockId: 'block-1', contextText: 'Extracted context 1' },
      { blockId: 'block-2', contextText: 'Extracted context 2' }
    ])
    expect(mockExtractBlockContext).toHaveBeenCalledTimes(2)
    expect(mockExtractBlockContext).toHaveBeenCalledWith(treeBlocks[0])
    expect(mockExtractBlockContext).toHaveBeenCalledWith(treeBlocks[1])
  })

  it('should handle empty tree blocks array', () => {
    const result = extractBlockContexts([])

    expect(result).toEqual([])
    expect(mockExtractBlockContext).not.toHaveBeenCalled()
  })
})
