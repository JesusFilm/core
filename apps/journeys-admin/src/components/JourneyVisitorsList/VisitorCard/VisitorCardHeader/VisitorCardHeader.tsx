import { ReactElement } from 'react'

interface Props {
  icon?: string
  name?: string
  location?: string
  source?: string
  createdAt: string
  duration: string
}

export function VisitorCardHeader({
  icon,
  name,
  location,
  source,
  createdAt,
  duration
}: Props): ReactElement {
  return <></>
}
