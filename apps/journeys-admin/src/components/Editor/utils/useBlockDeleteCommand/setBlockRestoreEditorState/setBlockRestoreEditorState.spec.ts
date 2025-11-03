import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../__generated__/BlockFields'
import {
  cardBlock,
  stepBlock
} from '../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'

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
    expect(dispatch).toHaveBeenCalledWith({
      activeContent: 'canvas',
      activeSlide: 1,
      selectedBlock: {
        __typename: 'CardBlock',
        backgroundColor: null,
        children: [],
        coverBlockId: null,
        fullscreen: false,
        backdropBlur: null,
        id: 'card1.id',
        parentBlockId: 'stepId',
        parentOrder: 0,
        themeMode: null,
        themeName: null
      },
      selectedStep: {
        __typename: 'StepBlock',
        children: [],
        id: 'step3.id',
        journeyId: 'journey-id',
        nextBlockId: 'someId',
        parentBlockId: null
      },
      type: 'SetEditorFocusAction'
    })
  })

  it('should update editor state when current block is a step block', () => {
    setBlockRestoreEditorState(
      stepBlockMock as unknown as TreeBlock<StepBlock>,
      stepBlockMock as unknown as TreeBlock<StepBlock>,
      dispatch
    )
    expect(dispatch).toHaveBeenCalledWith({
      activeContent: 'canvas',
      activeSlide: 0,
      selectedBlockId: 'step3.id',
      selectedStepId: 'step3.id',
      type: 'SetEditorFocusAction'
    })
  })
})
