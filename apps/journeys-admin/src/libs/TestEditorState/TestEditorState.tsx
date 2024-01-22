import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <div>
        {t('selectedBlock: ')}
        {state.selectedBlock?.id}
      </div>
      <div>
        {t('activeFab: ')}
        {ActiveFab[state.activeFab]}
      </div>
      <div>
        {t('activeTab: ')}
        {ActiveTab[state.activeTab]}
      </div>
      <div>
        {t('drawerTitle: ')}
        {state.drawerTitle}
      </div>
      <div>
        {t('selectedAttributeId: ')}
        {state.selectedAttributeId}
      </div>
      <div>
        {t('drawerMobileOpen: ')}
        {state.drawerMobileOpen.toString()}
      </div>
      <div>
        {t('journeyEditContentComponent: ')}
        {state.journeyEditContentComponent}
      </div>
      <div>
        {t('selectedComponent: ')}
        {state.selectedComponent}
      </div>
      {renderChildren === true && <div>{state.drawerChildren}</div>}
    </>
  )
}
