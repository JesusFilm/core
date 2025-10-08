/* eslint-disable i18next/no-literal-string */
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

// This is only used for testing purpose
// We don't need to translate the given text below

export function TestEditorState(): ReactElement {
  const { state } = useEditor()
  return (
    <>
      <div>selectedBlock: {state.selectedBlock?.id}</div>
      <div>selectedBlockId: {state.selectedBlockId}</div>
      <div>selectedStep: {state.selectedStep?.id}</div>
      <div>selectedStepId: {state.selectedStepId}</div>
      <div>selectedAttributeId: {state.selectedAttributeId}</div>
      <div>activeContent: {state.activeContent}</div>
      <div>activeCanvasDetailsDrawer: {state.activeCanvasDetailsDrawer}</div>
      <div>activeSlide: {state.activeSlide}</div>
      <div>selectedGoalUrl: {state.selectedGoalUrl}</div>
      <div>hoveredStep: {state.hoveredStep?.id}</div>
    </>
  )
}
