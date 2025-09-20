import { prismaMock } from '../../../test/prismaMock'

import { getEventContext, validateBlock } from './utils'

describe('event utils', () => {
  describe('validateBlock', () => {
    it('returns true when block exists, not deleted, and field matches', async () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'blockId',
        parentBlockId: 'parent-1',
        journeyId: 'journey-1',
        deletedAt: null
      } as any)

      await expect(
        validateBlock('blockId', 'parent-1', 'parentBlockId')
      ).resolves.toBe(true)
      expect(prismaMock.block.findFirst).toHaveBeenCalledWith({
        where: { id: 'blockId', deletedAt: null }
      })
    })

    it('returns false when block does not exist', async () => {
      prismaMock.block.findFirst.mockResolvedValue(null as any)

      await expect(
        validateBlock('missing-block', 'parent-1', 'parentBlockId')
      ).resolves.toBe(false)
    })

    it('returns false when id is null', async () => {
      await expect(validateBlock(null, 'journey-1', 'journeyId')).resolves.toBe(
        false
      )
      expect(prismaMock.block.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('getEventContext', () => {
    it('throws when block or journey not found', async () => {
      prismaMock.block.findUnique.mockResolvedValue(null as any)

      await expect(getEventContext('blockId')).rejects.toThrow(
        'Block or Journey not found'
      )
    })
  })
})
