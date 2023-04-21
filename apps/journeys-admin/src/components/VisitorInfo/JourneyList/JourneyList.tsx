import { ReactElement } from 'react'
import { JourneyCard } from './JourneyCard'

export interface Event {
  id: string
  value: string
  summaryEvent: boolean
}

export interface Journey {
  id: string
  title: string
  events: Event[]
}

export function JourneyList(): ReactElement {
  // transform events to journeys
  const journeys: Journey[] = [
    {
      id: 'journey1.id',
      title: 'Journey 1',
      events: [
        {
          id: 'click.id',
          value: 'click',
          summaryEvent: true
        },
        {
          id: 'generic1.id',
          value: 'generic 1',
          summaryEvent: false
        },
        {
          id: 'generic2.id',
          value: 'generic 2',
          summaryEvent: false
        },
        {
          id: 'stepView.id',
          value: 'stepView',
          summaryEvent: true
        },
        {
          id: 'generic3.id',
          value: 'generic 3',
          summaryEvent: false
        },
        {
          id: 'generic4.id',
          value: 'generic 4',
          summaryEvent: false
        },
        {
          id: 'videoPlay.id',
          value: 'videoPlay',
          summaryEvent: true
        }
      ]
    },
    {
      id: 'journey2.id',
      title: 'Journey 2',
      events: [
        {
          id: 'click.id',
          value: 'click',
          summaryEvent: true
        },
        {
          id: 'stepView.id',
          value: 'stepView',
          summaryEvent: true
        },
        {
          id: 'videoPlay.id',
          value: 'videoPlay',
          summaryEvent: true
        }
      ]
    }
  ]

  // CARD
  // each journey starts in a collapsed state, but can be expanded
  // determine which are the important events
  return (
    <>
      {journeys.map((journey) => (
        <JourneyCard key={journey.id} journey={journey} />
      ))}
    </>
  )
}
