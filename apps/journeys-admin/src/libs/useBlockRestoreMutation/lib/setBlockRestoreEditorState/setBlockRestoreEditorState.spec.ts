import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '../../../../../__generated__/BlockFields'
import { cardBlock, stepBlock } from '../../useBlockRestoreMutation.mock'
import { setBlockRestoreEditorState } from './setBlockRestoreEditorState'

describe('setBlockRestoreEditorState', () => {
  const dispatch = jest.fn()
  const stepBlockMock = {
    ...stepBlock,
    __typename: 'StepBlock'
  }
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should update editor state when current block is not a step block', () => {
    setBlockRestoreEditorState(
      cardBlock as TreeBlock,
      stepBlockMock as unknown as TreeBlock<StepBlock>,
      dispatch
    )
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      selectedStep: {
        __typename: 'StepBlock',
        id: 'step',
        journeyId: 'journeyId',
        nextBlockId: 'someId',
        parentBlockId: null
      },
      type: 'SetSelectedStepAction'
    })
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      selectedBlock: {
        __typename: 'CardBlock',
        backgroundColor: null,
        coverBlockId: null,
        fullscreen: false,
        id: 'card1.id',
        parentBlockId: 'stepId',
        parentOrder: 0,
        themeMode: null,
        themeName: null
      },
      type: 'SetSelectedBlockAction'
    })
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      activeContent: 'canvas',
      type: 'SetActiveContentAction'
    })
  })

  it('should update editor state when current block is a step block', () => {
    setBlockRestoreEditorState(
      stepBlockMock as unknown as TreeBlock<StepBlock>,
      stepBlockMock as unknown as TreeBlock<StepBlock>,
      dispatch
    )
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      activeSlide: 0,
      type: 'SetActiveSlideAction'
    })
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      selectedStep: {
        __typename: 'StepBlock',
        id: 'step',
        journeyId: 'journeyId',
        nextBlockId: 'someId',
        parentBlockId: null
      },
      type: 'SetSelectedStepAction'
    })
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      activeContent: 'canvas',
      type: 'SetActiveContentAction'
    })
  })
})
