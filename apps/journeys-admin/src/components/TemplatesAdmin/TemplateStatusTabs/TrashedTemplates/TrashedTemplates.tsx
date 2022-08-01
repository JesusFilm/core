import { ReactElement } from 'react'
import { SortOrder } from '../../../JourneyList/JourneySort'

interface TrashedTemplatesProps {
  event: string | undefined
  sortOrder?: SortOrder
}

export function TrashedTemplates({
  event,
  sortOrder
}: TrashedTemplatesProps): ReactElement {
  return <>Trashed Templates</>
}
