import { Dispatch, ReactElement, SetStateAction } from 'react'

import type { JourneyListEvent } from '../../JourneyList'
import { SortOrder } from '../../JourneySort'
import type { ContentType, JourneyStatus } from '../JourneyListView'

export interface SharedControlProps {
  selectedStatus: JourneyStatus
  handleStatusChange: (newStatus: JourneyStatus) => void
  sortOrder?: SortOrder
  setSortOrder: Dispatch<SetStateAction<SortOrder | undefined>>
  setActiveEvent: (event: JourneyListEvent) => void
}

export interface SharedModeProps extends SharedControlProps {
  renderList: (contentType: ContentType, status: JourneyStatus) => ReactElement
}
