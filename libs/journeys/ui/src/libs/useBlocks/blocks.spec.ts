import { activeBlockVar, isActiveBlockOrDescendant } from './blocks'

describe('blocks', () => {
  describe('activeBlockOrDescendant', () => {
    beforeEach(() => {
      activeBlockVar({
        id: 'a',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: false,
        nextBlockId: null,
        children: [
          {
            id: 'b',
            __typename: 'StepBlock',
            parentBlockId: null,
            locked: false,
            nextBlockId: null,
            children: [
              {
                id: 'c',
                __typename: 'StepBlock',
                parentBlockId: null,
                locked: false,
                nextBlockId: null,
                children: []
              }
            ]
          }
        ]
      })
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
})
