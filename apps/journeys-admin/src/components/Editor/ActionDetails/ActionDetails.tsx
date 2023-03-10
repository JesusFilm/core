import { ReactElement } from 'react'

interface ActionDetailsProps {
  url?: string
}

export function ActionDetails({ url }: ActionDetailsProps): ReactElement {
  return <div>{url}</div>
}
