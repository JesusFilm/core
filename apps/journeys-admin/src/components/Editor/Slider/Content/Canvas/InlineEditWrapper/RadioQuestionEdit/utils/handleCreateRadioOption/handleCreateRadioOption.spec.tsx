import { v4 as uuidv4 } from 'uuid'

import { JourneyFields } from '../../../../../../../../../../__generated__/JourneyFields'

import { handleCreateRadioOption } from './handleCreateRadioOption'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('handleCreateRadioOption', () => {
  const dispatch = jest.fn()
  const addBlock = jest.fn()
  const radioOptionBlockCreate = jest.fn()
  const parentBlockId = 'parentBlockId'
  const journey = { id: 'journeyId' } as unknown as JourneyFields
  const siblingCount = 3

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a radio option block when sibling count is provided', () => {
    mockUuidv4.mockReturnValueOnce('newOption.id')

    handleCreateRadioOption({
      dispatch,
      addBlock,
      radioOptionBlockCreate,
      parentBlockId,
      journey,
      siblingCount
    })

    expect(addBlock).toHaveBeenCalledTimes(1)
    expect(addBlock).toHaveBeenCalledWith({
      block: {
        id: 'newOption.id',
        parentBlockId: 'parentBlockId',
        parentOrder: 3,
        __typename: 'RadioOptionBlock',
        label: '',
        action: null,
        pollOptionImageBlockId: null,
        eventLabel: null
      },
      execute: expect.any(Function)
    })

    const addBlockCall = addBlock.mock.calls[0][0]
    const createdBlock = addBlockCall.block
    addBlockCall.execute()

    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetEditorFocusAction',
      selectedBlockId: createdBlock.id
    })

    expect(radioOptionBlockCreate).toHaveBeenCalledWith({
      variables: {
        input: {
          id: createdBlock.id,
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          label: ''
        }
      },
      optimisticResponse: {
        radioOptionBlockCreate: createdBlock
      },
      update: expect.any(Function)
    })
  })

  it('should return early when journey is not provided', () => {
    handleCreateRadioOption({
      dispatch,
      addBlock,
      radioOptionBlockCreate,
      parentBlockId: 'parentBlockId',
      journey: undefined,
      siblingCount
    })

    expect(addBlock).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    expect(radioOptionBlockCreate).not.toHaveBeenCalled()
  })
})
