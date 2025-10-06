'use client'

import type { ReactElement } from 'react'
import { useState } from 'react'

import { LayoutToolsVisuals } from './LayoutToolsVisuals'
import { PanelOriginal } from './PanelOriginal'
import { PanelResults } from './PanelResults/PanelResults'
import { PanelSettings } from './PanelSettings/PanelSettings'

export function PageToolsVisuals(): ReactElement {
  // Initially show only the dropzone/paste area
  const [showAllPanels, setShowAllPanels] = useState(false)

  return (
    <LayoutToolsVisuals showAllPanels={showAllPanels}>
      <PanelOriginal onShowAllPanels={() => setShowAllPanels(true)} />
      {showAllPanels && (
        <>
          <PanelSettings />
          <PanelResults />
        </>
      )}
    </LayoutToolsVisuals>
  )
}
