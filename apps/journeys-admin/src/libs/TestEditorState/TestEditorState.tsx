import { ReactElement } from 'react'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'

// This is only used for testing purpose
// We don't need to translate the given text below

export function TestEditorState(): ReactElement {
  const { state } = useEditor()
  return (
    <>
      <div>selectedBlock: {state.selectedBlock?.id}</div>
      <div>selectedStep: {state.selectedStep?.id}</div>
      <div>activeFab: {ActiveFab[state.activeFab]}</div>
      <div>selectedAttributeId: {state.selectedAttributeId}</div>
      <div>activeContent: {state.activeContent}</div>
      <div>activeCanvasDetailsDrawer: {state.activeCanvasDetailsDrawer}</div>
      <div>activeSlide: {state.activeSlide}</div>
      <div>selectedGoalUrl: {state.selectedGoalUrl}</div>
    </>
  )
}
