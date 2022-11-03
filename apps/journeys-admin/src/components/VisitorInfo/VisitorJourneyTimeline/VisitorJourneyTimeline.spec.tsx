import { render } from '@testing-library/react'
import { GetVisitorEvents_visitor_events as Event } from '../../../../__generated__/GetVisitorEvents'
import { VisitorJourneyTimeline } from './VisitorJourneyTimeline'

describe('VisitorJourneyTimeline', () => {
  const events: Event[] = [
    {
      __typename: 'ButtonClickEvent',
      id: 'ButtonClickEventId',
      journeyId: 'journeyId',
      label: 'How will you remember the journey?',
      value: 'Write a book',
      createdAt: '2022-11-02T03:20:26.368Z'
    },
    {
      __typename: 'RadioQuestionSubmissionEvent',
      id: 'RadioQuestionSubmissionEventId',
      journeyId: 'journeyId',
      label: 'How do you feel about your journey?',
      value: '10/10 would do it again',
      createdAt: '2022-11-02T03:20:26.368Z'
    },
    {
      __typename: 'TextResponseSubmissionEvent',
      id: 'TextResponseSubmissionEventId',
      journeyId: 'journeyId',
      label: 'How do you feel about your adventure?',
      value:
        'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.',
      createdAt: '2022-11-02T03:20:26.368Z'
    },
    {
      __typename: 'VideoCompleteEvent',
      id: 'VideoCompleteEventId',
      journeyId: 'journeyId',
      label: null,
      value: null,
      createdAt: '2022-11-02T03:20:26.368Z'
    },
    {
      __typename: 'VideoStartEvent',
      id: 'VideoStartEventId',
      journeyId: 'journeyId',
      label: null,
      value: null,
      createdAt: '2022-11-02T03:20:26.368Z'
    },
    {
      __typename: 'SignUpSubmissionEvent',
      id: 'SignUpSubmissionEventId',
      journeyId: 'journeyId',
      label: 'How do you feel at the end of the journey?',
      email: 'bilbo.baggins@example.com',
      value: 'Bilbo Baggins',
      createdAt: '2022-11-02T03:20:26.368Z'
    }
  ]

  it('filters events when compact', () => {
    const { getByText, queryByText } = render(
      <VisitorJourneyTimeline events={events} variant="compact" />
    )
    expect(getByText('How do you feel about your journey?')).toBeInTheDocument()
    expect(queryByText('Sign Up')).not.toBeInTheDocument()
  })
})
