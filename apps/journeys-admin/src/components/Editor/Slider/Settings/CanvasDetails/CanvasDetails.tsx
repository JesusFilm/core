import { ReactElement } from 'react'

import {
  ActiveCanvasDetailsDrawer,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { AddBlock } from './AddBlock'
import { Footer } from './Footer'
import { Properties } from './Properties'

export function CanvasDetails(): ReactElement {
  const {
    state: { activeCanvasDetailsDrawer }
  } = useEditor()
  switch (activeCanvasDetailsDrawer) {
    case ActiveCanvasDetailsDrawer.AddBlock:
      return <AddBlock />
    case ActiveCanvasDetailsDrawer.Footer:
      return <Footer />
    case ActiveCanvasDetailsDrawer.Properties:
      return <Properties />
  }
}
