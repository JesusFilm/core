import { ReactElement } from 'react'
import { VisitorJourneyListItem } from './VisitorJourneyListItem'

interface Props {
  id: string
  limit?: number
}

export function VisitorJourneyList({ id }: Props): ReactElement {
  const data: Array<{
    id: string
    title: string
    subtitle: string
    events: []
  }> = []
  return (
    <>
      {data.map((item) => (
        <VisitorJourneyListItem
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          events={item.events}
        />
      ))}
    </>
  )
}
