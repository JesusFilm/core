import { extractBlockContext } from '../../../../components/AiChat/utils/contextExtraction'

import { extractBlockContexts } from './extractBlockContexts'

// Mock the extractBlockContext function
jest.mock('../../../../components/AiChat/utils/contextExtraction', () => ({
  extractBlockContext: jest.fn()
}))

const mockExtractBlockContext = extractBlockContext as jest.MockedFunction<
  typeof extractBlockContext
>

describe('extractBlockContexts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should extract block contexts from tree blocks', () => {
    const treeBlocks = [
      {
        __typename: 'TypographyBlock' as const,
        id: 'block-1',
        parentBlockId: null,
        parentOrder: 0,
        content: 'Sample text content',
        variant: null,
        color: null,
        align: null,
        settings: null,
        children: []
      },
      {
        __typename: 'ImageBlock' as const,
        id: 'block-2',
        parentBlockId: null,
        parentOrder: 1,
        alt: 'Sample image',
        blurhash: 'sample-blurhash',
        height: 100,
        width: 100,
        src: 'https://example.com/image.jpg',
        scale: null,
        focalTop: null,
        focalLeft: null,
        children: []
      }
    ]

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
