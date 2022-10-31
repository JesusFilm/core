import { ComponentProps, ReactElement } from 'react'
import { VisitorJourneyTimeline } from '../../VisitorJourneyTimeline'

interface Props {
  title: string
  subtitle: string
  events: ComponentProps<typeof VisitorJourneyTimeline>['events']
}

export function VisitorJourneyListItem({
  title,
  subtitle,
  events
}: Props): ReactElement {
  return (
    <>
      {title} {subtitle}
      <VisitorJourneyTimeline events={events} filter={[]} variant="compact" />
    </>
  )
}
