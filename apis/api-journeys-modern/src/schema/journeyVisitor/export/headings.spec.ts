import { BlockHeaderRecord, deduplicateBlockHeadersByBlockId } from './headings'

describe('headings', () => {
  describe('deduplicateBlockHeadersByBlockId', () => {
    it('should return all headers when there are no duplicates', () => {
      const headers: BlockHeaderRecord[] = [
        { blockId: 'block1', label: 'Label 1' },
        { blockId: 'block2', label: 'Label 2' },
        { blockId: 'block3', label: 'Label 3' }
      ]

      const result = deduplicateBlockHeadersByBlockId(headers)

      expect(result).toHaveLength(3)
      expect(result).toEqual(headers)
    })

    it('should keep only the first label for each blockId when there are duplicates', () => {
      const headers: BlockHeaderRecord[] = [
        { blockId: 'block1', label: 'First Label' },
        { blockId: 'block1', label: 'Second Label' },
        { blockId: 'block2', label: 'Another Label' },
        { blockId: 'block1', label: 'Third Label' }
      ]

      const result = deduplicateBlockHeadersByBlockId(headers)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ blockId: 'block1', label: 'First Label' })
      expect(result[1]).toEqual({ blockId: 'block2', label: 'Another Label' })
    })

    it('should return an empty array when given an empty array', () => {
      const result = deduplicateBlockHeadersByBlockId([])

      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should handle single-element arrays', () => {
      const headers: BlockHeaderRecord[] = [
        { blockId: 'block1', label: 'Only Label' }
      ]

      const result = deduplicateBlockHeadersByBlockId(headers)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ blockId: 'block1', label: 'Only Label' })
    })

    it('should preserve order of first occurrences', () => {
      const headers: BlockHeaderRecord[] = [
        { blockId: 'block3', label: 'Label C' },
        { blockId: 'block1', label: 'Label A' },
        { blockId: 'block2', label: 'Label B' },
        { blockId: 'block1', label: 'Label A Duplicate' },
        { blockId: 'block3', label: 'Label C Duplicate' }
      ]

      const result = deduplicateBlockHeadersByBlockId(headers)

      expect(result).toHaveLength(3)
      expect(result[0].blockId).toBe('block3')
      expect(result[1].blockId).toBe('block1')
      expect(result[2].blockId).toBe('block2')
    })
  })
})
