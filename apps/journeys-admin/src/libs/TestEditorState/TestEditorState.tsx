import { ReactElement } from 'react'

import {
  ActiveFab,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'

interface TestEditorStateProps {
  renderChildren?: boolean
}

export function TestEditorState({
  renderChildren
}: TestEditorStateProps): ReactElement {
  const { state } = useEditor()
  return (
    <>
      <div>selectedBlock: {state.selectedBlock?.id}</div>
      <div>activeFab: {ActiveFab[state.activeFab]}</div>
      <div>activeTab: {ActiveTab[state.activeTab]}</div>
      <div>drawerTitle: {state.drawerTitle}</div>
      <div>selectedAttributeId: {state.selectedAttributeId}</div>
      <div>drawerMobileOpen: {state.drawerMobileOpen.toString()}</div>
      <div>
        journeyEditContentComponent: {state.journeyEditContentComponent}
      </div>
      <div>selectedComponent: {state.selectedComponent}</div>
      {renderChildren === true && <div>{state.drawerChildren}</div>}
    </>
  )
}
