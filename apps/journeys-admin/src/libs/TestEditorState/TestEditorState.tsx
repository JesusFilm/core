import { ReactElement } from 'react'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'

// This is only used for testing purpose
// We don't need to translate the given text below

export function TestEditorState(): ReactElement {
  const { state } = useEditor()
  return (
    <>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>selectedBlock: {state.selectedBlock?.id}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>activeFab: {ActiveFab[state.activeFab]}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>selectedAttributeId: {state.selectedAttributeId}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>activeContent: {state.activeContent}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>selectedComponent: {state.selectedComponent}</div>
    </>
  )
}
