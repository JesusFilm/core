import { ReactElement } from 'react'
import { AuthUser } from 'next-firebase-auth'
import { SortOrder } from '../../../JourneyList/JourneySort'

interface ArchivedTemplateProps {
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

export function ArchivedTemplates({
  event,
  sortOrder,
  authUser
}: ArchivedTemplateProps): ReactElement {
  return <>Archived Templates</>
}
