import { ActiveContent, ActiveSlide } from '@core/journeys/ui/EditorProvider'
import { EditorAction } from '@core/journeys/ui/EditorProvider/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { Dispatch } from 'react'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'

export function setPropertiesEditorState(
  selectedStep: TreeBlock<StepBlock>,
  activeContent: ActiveContent,
  dispatch: Dispatch<EditorAction>
): void {
  dispatch({
    type: 'SetActiveSlideAction',
    activeSlide: ActiveSlide.Content
  })
  dispatch({
    type: 'SetSelectedStepAction',
    selectedStep: selectedStep
  })
  // expensive ui change - only do if active content is not on canvas
  if (activeContent !== ActiveContent.Canvas)
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Canvas
    })
}
