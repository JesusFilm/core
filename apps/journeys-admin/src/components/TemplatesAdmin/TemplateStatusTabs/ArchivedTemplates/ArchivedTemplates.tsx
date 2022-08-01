import { ReactElement } from 'react'
import { SortOrder } from '../../../JourneyList/JourneySort'

interface ArchivedTemplateProps {
  event: string | undefined
  sortOrder?: SortOrder
}

export function ArchivedTemplates({
  event,
  sortOrder
}: ArchivedTemplateProps): ReactElement {
  return <>Archived Templates</>
}
