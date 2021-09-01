import reducer, { setBlocks, navigate, ConductorState } from './conductorSlice'

describe('conductorSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(
      {
        blocks: []
      }
    )
  })

  describe('setBlocks', () => {
    it('should set blocks and set first block to active', () => {
      const previousState: ConductorState = { blocks: [] }
      expect(
        reducer(previousState, setBlocks([{ __typename: 'Step', id: 'Step 1' }]))
      ).toEqual(
        {
          blocks: [{ __typename: 'Step', id: 'Step 1' }],
          active: { __typename: 'Step', id: 'Step 1' }
        }
      )
    })

    it('should set blocks to empty', () => {
      const previousState: ConductorState = { blocks: [] }
      expect(
        reducer(previousState, setBlocks([]))
      ).toEqual(
        {
          blocks: [],
          active: undefined
        }
      )
    })
  })

  describe('navigate', () => {
    it('should change active block when ID exists', () => {
      const previousState: ConductorState = { blocks: [{ __typename: 'Step', id: 'Step 1' }] }
      expect(
        reducer(previousState, navigate('Step 1'))
      ).toEqual(
        {
          ...previousState,
          active: { __typename: 'Step', id: 'Step 1' }
        }
      )
    })
    it('should not change active block when ID does not exist', () => {
      const previousState: ConductorState = {
        blocks: [{ __typename: 'Step', id: 'Step 1' }], active: { __typename: 'Step', id: 'Step 1' }
      }
      expect(
        reducer(previousState, navigate('Step 2'))
      ).toEqual(
        {
          ...previousState,
          active: { __typename: 'Step', id: 'Step 1' }
        }
      )
    })

    it('should change active block when active is not last', () => {
      const previousState: ConductorState = {
        blocks: [{ __typename: 'Step', id: 'Step 1' }, { __typename: 'Step', id: 'Step 2' }],
        active: { __typename: 'Step', id: 'Step 1' }
      }
      expect(
        reducer(previousState, navigate())
      ).toEqual(
        {
          ...previousState,
          active: { __typename: 'Step', id: 'Step 2' }
        }
      )
    })

    it('should not active block when active is last', () => {
      const previousState: ConductorState = {
        blocks: [{ __typename: 'Step', id: 'Step 1' }, { __typename: 'Step', id: 'Step 2' }],
        active: { __typename: 'Step', id: 'Step 2' }
      }
      expect(
        reducer(previousState, navigate())
      ).toEqual(
        {
          ...previousState
        }
      )
    })

    it('should not change active block when active not set', () => {
      const previousState: ConductorState = { blocks: [{ __typename: 'Step', id: 'Step 1' }] }
      expect(
        reducer(previousState, navigate())
      ).toEqual(
        {
          ...previousState
        }
      )
    })
  })
})
