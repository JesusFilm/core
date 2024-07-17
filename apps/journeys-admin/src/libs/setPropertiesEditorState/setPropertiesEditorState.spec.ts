import { ActiveContent } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { setPropertiesEditorState } from './setPropertiesEditorState'

describe('setPropertiesEditorState', () => {
  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'step1.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const dispatch = jest.fn()

  beforeEach(() => jest.clearAllMocks())
  it('should set edior state', () => {
    setPropertiesEditorState(selectedStep, ActiveContent.Canvas, dispatch)
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      activeSlide: 1,
      type: 'SetActiveSlideAction'
    })
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      selectedStep: {
        __typename: 'StepBlock',
        children: [],
        id: 'step1.id',
        locked: false,
        nextBlockId: null,
        parentBlockId: null,
        parentOrder: 0
      },
      type: 'SetSelectedStepAction'
    })
  })

  it('should set the editors active content to canvas if it is something else', () => {
    setPropertiesEditorState(selectedStep, ActiveContent.Social, dispatch)
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      activeSlide: 1,
      type: 'SetActiveSlideAction'
    })
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      selectedStep: {
        __typename: 'StepBlock',
        children: [],
        id: 'step1.id',
        locked: false,
        nextBlockId: null,
        parentBlockId: null,
        parentOrder: 0
      },
      type: 'SetSelectedStepAction'
    })

    expect(dispatch).toHaveBeenNthCalledWith(3, {
      activeContent: 'canvas',
      type: 'SetActiveContentAction'
    })
  })
})
