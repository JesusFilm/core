import { Dispatch } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveContent,
  ActiveSlide,
  EditorAction
} from '@core/journeys/ui/EditorProvider'

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
      selectedStepId: currentBlock.id,
      selectedBlockId: currentBlock.id,
      activeContent: ActiveContent.Canvas
    })
  } else {
    dispatch({
      type: 'SetEditorFocusAction',
      activeContent: ActiveContent.Canvas,
      activeSlide: ActiveSlide.Content,
      selectedBlock: currentBlock,
      selectedStep
    })
  }
}
