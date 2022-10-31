import { ReactElement } from 'react'

interface Props {
  id: string
}

export function VisitorJourneyDrawer({ id }: Props): ReactElement {
  return <>Visitor Journey List: {id}</>
}
