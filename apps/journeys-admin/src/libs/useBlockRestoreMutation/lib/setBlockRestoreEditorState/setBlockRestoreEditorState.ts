import {
  ActiveContent,
  ActiveSlide,
  EditorAction
} from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { Dispatch } from 'react'
import { BlockFields_StepBlock as StepBlock } from '../../../../../__generated__/BlockFields'

export function setBlockRestoreEditorState(
  currentBlock: TreeBlock,
  selectedStep: TreeBlock<StepBlock>,
  dispatch: Dispatch<EditorAction>
): void {
  if (currentBlock.__typename === 'StepBlock') {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
    dispatch({
      type: 'SetSelectedStepAction',
      selectedStep: currentBlock
    })
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Canvas
    })
  } else {
    dispatch({
      type: 'SetSelectedStepAction',
      selectedStep: selectedStep
    })
    dispatch({
      type: 'SetSelectedBlockAction',
      selectedBlock: currentBlock
    })
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Canvas
    })
  }
}
