import { render } from '@testing-library/react'
import {
  buttonClickEvent,
  chatOpenedEvent,
  radioQuestionSubmissionEvent,
  textResponseSubmissionEvent,
  videoCompleteEvent,
  videoStartEvent,
  signUpSubmissionEvent,
  journeyViewEvent
} from '../../utils/data'
import {
  GetVisitorEvents_visitor_events_VideoCompleteEvent as VideoCompleteEvent,
  GetVisitorEvents_visitor_events_VideoStartEvent as VideoStartEvent
} from '../../../../../../__generated__/GetVisitorEvents'
import { TimelineItem } from '../../utils'
import { TimelineEvent } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('TimelineEvent', () => {
  it('shows buttonClickEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={buttonClickEvent} />
    )
    expect(
      getByText(buttonClickEvent.event.label as string)
    ).toBeInTheDocument()
    expect(getByText('Button clicked:')).toBeInTheDocument()
  })

  it('shows chatOpenedEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={chatOpenedEvent} />
    )
    expect(getByText('Chat Opened')).toBeInTheDocument()
    expect(getByText('Chat started on {{messagePlatform}}')).toBeInTheDocument()
  })

  it('shows chatOpenedEvent when messagePlatform is null', () => {
    const chatEvent: TimelineItem = {
      ...chatOpenedEvent,
      event: {
        ...chatOpenedEvent.event,
        value: null
      }
    }
    const { getByText } = render(<TimelineEvent timelineItem={chatEvent} />)
    expect(getByText('Chat Opened')).toBeInTheDocument()
    expect(getByText('Chat started on {{messagePlatform}}')).toBeInTheDocument()
  })

  it('shows radioQuestionSubmissionEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={radioQuestionSubmissionEvent} />
    )
    expect(
      getByText(radioQuestionSubmissionEvent.event.label as string)
    ).toBeInTheDocument()
    expect(getByText('Poll selected:')).toBeInTheDocument()
  })

  it('shows textResponseSubmissionEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={textResponseSubmissionEvent} />
    )
    expect(
      getByText(textResponseSubmissionEvent.event.label as string)
    ).toBeInTheDocument()
    expect(getByText('Response submitted:')).toBeInTheDocument()
  })

  it('shows videoCompleteEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={videoCompleteEvent} />
    )
    expect(getByText('JESUS youtube')).toBeInTheDocument()
    expect(getByText('YouTube')).toBeInTheDocument()
    expect(getByText('Video completed:')).toBeInTheDocument()
  })

  it('shows VideoCompleteEvent with null source', () => {
    const videoComplete: TimelineItem = {
      ...videoCompleteEvent,
      event: {
        ...videoCompleteEvent.event,
        value: null,
        source: null
      } as unknown as VideoCompleteEvent
    }
    const { getByText } = render(<TimelineEvent timelineItem={videoComplete} />)
    expect(getByText('JESUS youtube')).toBeInTheDocument()
    expect(getByText('Video')).toBeInTheDocument()
    expect(getByText('Video completed:')).toBeInTheDocument()
  })

  it('shows videoStartEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={videoStartEvent} />
    )
    expect(getByText('JESUS internal')).toBeInTheDocument()
    expect(getByText('Jesus Film Library')).toBeInTheDocument()
    expect(getByText('Video started:')).toBeInTheDocument()
  })

  it('shows videoStartEvent with null source', () => {
    const videoStart: TimelineItem = {
      ...videoStartEvent,
      event: {
        ...videoStartEvent.event,
        value: null,
        source: null
      } as unknown as VideoStartEvent
    }
    const { getByText } = render(<TimelineEvent timelineItem={videoStart} />)
    expect(getByText('JESUS internal')).toBeInTheDocument()
    expect(getByText('Video')).toBeInTheDocument()
    expect(getByText('Video started:')).toBeInTheDocument()
  })

  it('shows signUpSubmissionEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={signUpSubmissionEvent} />
    )
    expect(getByText('Sign Up')).toBeInTheDocument()
    expect(
      getByText('Bilbo Bagginsbilbo.baggins@example.com')
    ).toBeInTheDocument()
    expect(getByText('Form submitted:')).toBeInTheDocument()
  })

  it('shows journeyViewEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={journeyViewEvent} />
    )
    expect(getByText('Journey Started')).toBeInTheDocument()
    expect(getByText('3:20 AM')).toBeInTheDocument()
  })
})
