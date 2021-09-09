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
        reducer(previousState, setBlocks([{
          __typename: 'StepBlock',
          id: 'Step 1',
          parentBlockId: null,
          children: []
        }]))
      ).toEqual(
        {
          blocks: [{
            __typename: 'StepBlock',
            id: 'Step 1',
            parentBlockId: null,
            children: []
          }],
          active: {
            __typename: 'StepBlock',
            id: 'Step 1',
            parentBlockId: null,
            children: []
          }
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
      const previousState: ConductorState = {
        blocks: [{
          __typename: 'StepBlock',
          id: 'Step 1',
          parentBlockId: null,
          children: []
        }]
      }
      expect(
        reducer(previousState, navigate('Step 1'))
      ).toEqual(
        {
          ...previousState,
          active: {
            __typename: 'StepBlock',
            id: 'Step 1',
            parentBlockId: null,
            children: []
          }
        }
      )
    })
    it('should not change active block when ID does not exist', () => {
      const previousState: ConductorState = {
        blocks: [{
          __typename: 'StepBlock',
          id: 'Step 1',
          parentBlockId: null,
          children: []
        }],
        active: {
          __typename: 'StepBlock',
          id: 'Step 1',
          parentBlockId: null,
          children: []
        }
      }
      expect(
        reducer(previousState, navigate('Step 2'))
      ).toEqual(
        {
          ...previousState,
          active: {
            __typename: 'StepBlock',
            id: 'Step 1',
            parentBlockId: null,
            children: []
          }
        }
      )
    })

    it('should change active block when active is not last', () => {
      const previousState: ConductorState = {
        blocks: [{
          __typename: 'StepBlock',
          id: 'Step 1',
          parentBlockId: null,
          children: []
        }, {
          __typename: 'StepBlock',
          id: 'Step 2',
          parentBlockId: null,
          children: []
        }],
        active: {
          __typename: 'StepBlock',
          id: 'Step 1',
          parentBlockId: null,
          children: []
        }
      }
      expect(
        reducer(previousState, navigate())
      ).toEqual(
        {
          ...previousState,
          active: {
            __typename: 'StepBlock',
            id: 'Step 2',
            parentBlockId: null,
            children: []
          }
        }
      )
    })

    it('should not active block when active is last', () => {
      const previousState: ConductorState = {
        blocks: [{
          __typename: 'StepBlock',
          id: 'Step 1',
          parentBlockId: null,
          children: []
        }, {
          __typename: 'StepBlock',
          id: 'Step 2',
          parentBlockId: null,
          children: []
        }],
        active: {
          __typename: 'StepBlock',
          id: 'Step 2',
          parentBlockId: null,
          children: []
        }
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
      const previousState: ConductorState = {
        blocks: [{
          __typename: 'StepBlock',
          id: 'Step 1',
          parentBlockId: null,
          children: []
        }]
      }
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
