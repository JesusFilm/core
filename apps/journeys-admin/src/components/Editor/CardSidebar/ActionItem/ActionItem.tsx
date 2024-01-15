import { ReactElement } from 'react'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import TargetIcon from '@core/shared/ui/icons/Target'

import { JourneyEditContentComponentItem } from '../JourneyEditContentComponentItem'

export function ActionItem(): ReactElement {
  return (
    <JourneyEditContentComponentItem
      component={ActiveJourneyEditContent.Action}
    >
      <TargetIcon color="error" />
    </JourneyEditContentComponentItem>
  )
}
