import { ReactElement } from 'react'
import { AuthUser } from 'next-firebase-auth'
import { SortOrder } from '../../../JourneyList/JourneySort'
import { activeTemplates as trashedTemplates } from '../ActiveTemplates/ActiveTemplates'

interface TrashedTemplatesProps {
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

export function TrashedTemplates({
  event,
  sortOrder,
  authUser
}: TrashedTemplatesProps): ReactElement {
  return <>Trashed Templates</>
}
