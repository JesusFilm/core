import { ReactElement } from 'react'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'

import { CanvasDetails } from './CanvasDetails'
import { GoalDetails } from './GoalDetails'
import { SocialDetails } from './SocialDetails'

export function Settings(): ReactElement {
  const {
    state: { activeContent }
  } = useEditor()

  switch (activeContent) {
    case ActiveContent.Social:
      return <SocialDetails />
    case ActiveContent.Goals:
      return <GoalDetails />
    case ActiveContent.Canvas:
      return <CanvasDetails />
  }
}
