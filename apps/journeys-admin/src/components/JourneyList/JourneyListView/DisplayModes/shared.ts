import { Dispatch, ReactElement, SetStateAction } from 'react'

import type { JourneyListEvent } from '../../JourneyList'
import { SortOrder } from '../../JourneySort'
import type {
  ContentType,
  JourneyListDisplay,
  JourneyStatus
} from '../JourneyListView'

export interface SharedControlProps {
  selectedStatus: JourneyStatus
  handleStatusChange: (newStatus: JourneyStatus) => void
  sortOrder?: SortOrder
  setSortOrder: Dispatch<SetStateAction<SortOrder | undefined>>
  display?: JourneyListDisplay
  setDisplay?: (display: JourneyListDisplay) => void
  setActiveEvent: (event: JourneyListEvent) => void
}

export interface SharedModeProps extends SharedControlProps {
  renderList: (contentType: ContentType, status: JourneyStatus) => ReactElement
}
