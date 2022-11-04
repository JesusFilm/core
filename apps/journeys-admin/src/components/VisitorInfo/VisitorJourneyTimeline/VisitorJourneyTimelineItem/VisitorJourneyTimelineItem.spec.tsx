import { render } from '@testing-library/react'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../__generated__/GetVisitorEvents'
import { VisitorJourneyTimelineItem } from './VisitorJourneyTimelineItem'

describe('VisitorJourneyTimelineItem', () => {
  it('shows buttonClickEvent', () => {
    const event: Event = {
      __typename: 'ButtonClickEvent',
      id: 'ButtonClickEventId',
      journeyId: 'journeyId',
      label: 'How will you remember the journey?',
      value: 'Write a book',
      createdAt: '2022-11-02T03:20:26.368Z'
    }
    const { getByText } = render(<VisitorJourneyTimelineItem event={event} />)
    expect(getByText(event.label as string)).toBeInTheDocument()
    expect(getByText('Button clicked')).toBeInTheDocument()
  })
  it('shows radioQuestionSubmissionEvent', () => {
    const event: Event = {
      __typename: 'RadioQuestionSubmissionEvent',
      id: 'RadioQuestionSubmissionEventId',
      journeyId: 'journeyId',
      label: 'How do you feel about your journey?',
      value: '10/10 would do it again',
      createdAt: '2022-11-02T03:20:26.368Z'
    }
    const { getByText } = render(<VisitorJourneyTimelineItem event={event} />)
    expect(getByText(event.label as string)).toBeInTheDocument()
    expect(getByText('Poll selected')).toBeInTheDocument()
  })
  it('shows textResponseSubmissionEvent', () => {
    const event: Event = {
      __typename: 'TextResponseSubmissionEvent',
      id: 'TextResponseSubmissionEventId',
      journeyId: 'journeyId',
      label: 'How do you feel about your adventure?',
      value:
        'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.',
      createdAt: '2022-11-02T03:20:26.368Z'
    }
    const { getByText } = render(<VisitorJourneyTimelineItem event={event} />)
    expect(getByText(event.label as string)).toBeInTheDocument()
    expect(getByText('Response submitted')).toBeInTheDocument()
  })
  it('shows videoCompleteEvent', () => {
    const event: Event = {
      __typename: 'VideoCompleteEvent',
      id: 'VideoCompleteEventId',
      journeyId: 'journeyId',
      label: 'JESUS',
      value: 'youTube',
      createdAt: '2022-11-02T03:20:26.368Z',
      source: VideoBlockSource.youTube
    }
    const { getByText } = render(<VisitorJourneyTimelineItem event={event} />)
    expect(getByText('JESUS')).toBeInTheDocument()
    expect(getByText('YouTube')).toBeInTheDocument()
    expect(getByText('Video completed')).toBeInTheDocument()
  })
  it('shows videoStartEvent', () => {
    const event: Event = {
      __typename: 'VideoStartEvent',
      id: 'VideoStartEventId',
      journeyId: 'journeyId',
      label: 'JESUS',
      value: 'internal',
      createdAt: '2022-11-02T03:20:26.368Z',
      source: VideoBlockSource.internal
    }
    const { getByText } = render(<VisitorJourneyTimelineItem event={event} />)
    expect(getByText('JESUS')).toBeInTheDocument()
    expect(getByText('Jesus Film Library')).toBeInTheDocument()
    expect(getByText('Video started')).toBeInTheDocument()
  })
  it('shows videoStartEvent with null source', () => {
    const event: Event = {
      __typename: 'VideoStartEvent',
      id: 'VideoStartEventId',
      journeyId: 'journeyId',
      label: 'JESUS',
      value: null,
      createdAt: '2022-11-02T03:20:26.368Z',
      source: null
    }
    const { getByText } = render(<VisitorJourneyTimelineItem event={event} />)
    expect(getByText('JESUS')).toBeInTheDocument()
    expect(getByText('Video')).toBeInTheDocument()
    expect(getByText('Video started')).toBeInTheDocument()
  })
  it('shows signUpSubmissionEvent', () => {
    const event: Event = {
      __typename: 'SignUpSubmissionEvent',
      id: 'SignUpSubmissionEventId',
      journeyId: 'journeyId',
      label: 'How do you feel at the end of the journey?',
      email: 'bilbo.baggins@example.com',
      value: 'Bilbo Baggins',
      createdAt: '2022-11-02T03:20:26.368Z'
    }
    const { getByText } = render(<VisitorJourneyTimelineItem event={event} />)
    expect(getByText('Sign Up')).toBeInTheDocument()
    expect(
      getByText('Bilbo Bagginsbilbo.baggins@example.com')
    ).toBeInTheDocument()
    expect(getByText('Form submitted')).toBeInTheDocument()
  })
})
