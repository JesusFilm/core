import { ReactElement } from 'react'
import { AccessDenied } from '../AccessDenied'

export function PublisherInvite(): ReactElement {
  return (
    <AccessDenied
      title="You need access"
      description="You need to be a publisher to view this template."
    />
  )
}
