import { ReactElement } from 'react'

import {
  ActiveFab,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'

interface TestEditorStateProps {
  renderChildren?: boolean
}

// This is only used for testing purpose
// We don't need to translate the given text below

export function TestEditorState({
  renderChildren
}: TestEditorStateProps): ReactElement {
  const { state } = useEditor()
  return (
    <>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>selectedBlock: {state.selectedBlock?.id}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>activeFab: {ActiveFab[state.activeFab]}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>activeTab: {ActiveTab[state.activeTab]}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>drawerTitle: {state.drawerTitle}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>selectedAttributeId: {state.selectedAttributeId}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>drawerMobileOpen: {state.drawerMobileOpen.toString()}</div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>
        journeyEditContentComponent: {state.journeyEditContentComponent}
      </div>
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <div>selectedComponent: {state.selectedComponent}</div>
      {renderChildren === true && <div>{state.drawerChildren}</div>}
    </>
  )
}
