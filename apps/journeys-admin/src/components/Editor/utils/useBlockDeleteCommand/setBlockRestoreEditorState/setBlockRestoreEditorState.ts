import {
  ActiveContent,
  ActiveSlide,
  EditorAction
} from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { Dispatch } from 'react'
import { BlockFields_StepBlock as StepBlock } from '../../../../../../__generated__/BlockFields'

export function setBlockRestoreEditorState(
  currentBlock: TreeBlock,
  selectedStep: TreeBlock<StepBlock>,
  dispatch: Dispatch<EditorAction>
): void {
  if (currentBlock.__typename === 'StepBlock') {
    dispatch({
      type: 'SetEditorFocusAction',
      activeSlide: ActiveSlide.JourneyFlow,
      selectedStep: currentBlock,
      activeContent: ActiveContent.Canvas
    })
  } else {
    dispatch({
      type: 'SetEditorFocusAction',
      activeContent: ActiveContent.Canvas,
      activeSlide: ActiveSlide.Content,
      selectedBlock: currentBlock,
      selectedStep: selectedStep
    })
  }
}
