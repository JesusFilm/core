import { ReactElement } from 'react'

import {
  ActiveCanvasDetailsDrawer,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { AddBlock } from './AddBlock'
import { JourneyAppearance } from './JourneyAppearance'
import { Properties } from './Properties'

export function CanvasDetails(): ReactElement {
  const {
    state: { activeCanvasDetailsDrawer }
  } = useEditor()
  switch (activeCanvasDetailsDrawer) {
    case ActiveCanvasDetailsDrawer.AddBlock:
      return <AddBlock />
    case ActiveCanvasDetailsDrawer.JourneyAppearance:
      return <JourneyAppearance />
    case ActiveCanvasDetailsDrawer.Properties:
      return <Properties />
  }
}
