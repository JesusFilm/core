import { ReactElement } from 'react'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { JourneyEditContentComponentItem } from '../JourneyEditContentComponentItem'

export function JourneyFlowItem(): ReactElement {
  return (
    <JourneyEditContentComponentItem
      component={ActiveJourneyEditContent.JourneyFlow}
    >
      <Globe1Icon color="error" />
    </JourneyEditContentComponentItem>
  )
}
