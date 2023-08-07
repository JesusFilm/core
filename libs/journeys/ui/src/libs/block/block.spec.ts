import {
  blockHistoryVar,
  isActiveBlockOrDescendant,
  nextActiveBlock,
  prevActiveBlock,
  treeBlocksVar
} from './block'

const step = {
  id: 'step.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: []
}

describe('block', () => {
  describe('activeBlockOrDescendant', () => {
    beforeEach(() => {
      blockHistoryVar([
        {
          id: 'a',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: [
            {
              id: 'b',
              __typename: 'StepBlock',
              parentBlockId: null,
              parentOrder: 0,
              locked: false,
              nextBlockId: null,
              children: [
                {
                  id: 'c',
                  __typename: 'StepBlock',
                  parentBlockId: null,
                  parentOrder: 0,
                  locked: false,
                  nextBlockId: null,
                  children: []
                }
              ]
            }
          ]
        }
      ])
    })

    it('returns true where descendant blockId provided', () => {
      expect(isActiveBlockOrDescendant('c')).toBe(true)
    })

    it('returns false where non-descendant blockId provided', () => {
      expect(isActiveBlockOrDescendant('d')).toBe(false)
    })

    it('returns true where active blockId provided', () => {
      expect(isActiveBlockOrDescendant('a')).toBe(true)
    })
  })

  describe('nextActiveBlock', () => {
    describe('navigate by argument in nextActiveBlock', () => {
      it('should navigate to passed in id by default', () => {
        treeBlocksVar([
          { ...step, id: 'step1.id' },
          { ...step, id: 'step2.id' },
          { ...step, id: 'step3.id' }
        ])
        blockHistoryVar([{ ...step, id: 'step1.id' }])

        nextActiveBlock({ id: 'step3.id' })

        expect(blockHistoryVar()).toHaveLength(2)
        expect(blockHistoryVar()[1].id).toBe('step3.id')
      })
    })

    describe('navigate by nextBlockId on step block', () => {
      it('should navigate to nextBlockId if no passed in id', () => {
        treeBlocksVar([
          { ...step, id: 'step1.id' },
          { ...step, id: 'step2.id' },
          { ...step, id: 'step3.id', nextBlockId: 'step1.id' }
        ])
        blockHistoryVar([{ ...step, id: 'step3.id', nextBlockId: 'step1.id' }])

        nextActiveBlock()

        expect(blockHistoryVar()).toHaveLength(2)
        expect(blockHistoryVar()[1].id).toBe('step1.id')
      })

      it('should not navigate if nextBlockId is invalid', () => {
        treeBlocksVar([
          { ...step, id: 'step1.id' },
          { ...step, id: 'step2.id', nextBlockId: 'invalidId' },
          { ...step, id: 'step3.id' }
        ])
        blockHistoryVar([{ ...step, id: 'step2.id', nextBlockId: 'invalidId' }])

        nextActiveBlock()

        expect(blockHistoryVar()).toHaveLength(1)
        expect(blockHistoryVar()[0].id).toBe('step2.id')
      })
    })

    describe('navigate by tree block parent order', () => {
      it('should navigate to next step in tree if no nextBlockId', () => {
        treeBlocksVar([
          { ...step, id: 'step1.id' },
          { ...step, id: 'step2.id' },
          { ...step, id: 'step3.id' }
        ])
        blockHistoryVar([{ ...step, id: 'step1.id' }])

        nextActiveBlock()

        expect(blockHistoryVar()).toHaveLength(2)
        expect(blockHistoryVar()[1].id).toBe('step2.id')
      })

      it('should not navigate to next step if it does not exist', () => {
        treeBlocksVar([
          { ...step, id: 'step1.id' },
          { ...step, id: 'step2.id', parentOrder: 1 },
          { ...step, id: 'step3.id', parentOrder: 2 }
        ])
        blockHistoryVar([{ ...step, id: 'step3.id', parentOrder: 2 }])

        nextActiveBlock()

        expect(blockHistoryVar()).toHaveLength(1)
        expect(blockHistoryVar()[0].id).toBe('step3.id')
      })
    })
  })

  describe('prevActiveBlock', () => {
    it('should navigate to previous step in tree', () => {
      blockHistoryVar([
        { ...step, id: 'step1.id' },
        { ...step, id: 'step2.id' },
        { ...step, id: 'step3.id' }
      ])

      prevActiveBlock()

      expect(blockHistoryVar()).toHaveLength(2)
      expect(blockHistoryVar()[0].id).toBe('step1.id')
      expect(blockHistoryVar()[1].id).toBe('step2.id')
    })

    it('should not navigate if no previous block exists in tree', () => {
      blockHistoryVar([{ ...step, id: 'step1.id' }])

      prevActiveBlock()

      expect(blockHistoryVar()).toHaveLength(1)
      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })
  })
})
