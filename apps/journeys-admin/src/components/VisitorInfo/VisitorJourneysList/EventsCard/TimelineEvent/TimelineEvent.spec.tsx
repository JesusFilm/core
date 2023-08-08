import { render } from '@testing-library/react'

import {
  buttonClickLinkEvent,
  buttonClickNavigateEvent,
  buttonClickNavigateToBlockEvent,
  buttonClickNavigateToJourneyEvent,
  chatOpenedEvent,
  journeyViewEvent,
  radioQuestionSubmissionEvent,
  signUpSubmissionEvent,
  stepNextEvent,
  stepViewEvent,
  textResponseSubmissionEvent,
  videoCompleteEvent,
  videoExpandEvent,
  videoPauseEvent,
  videoPlayEvent,
  videoProgressEvent,
  videoStartEvent
} from '../../utils/data'

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
  it('shows journeyViewEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={journeyViewEvent} />
    )
    expect(getByText('Journey Started')).toBeInTheDocument()
    expect(getByText('3:20 AM')).toBeInTheDocument()
  })

  it('shows chatOpenedEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={chatOpenedEvent} />
    )
    expect(getByText('Chat Opened:')).toBeInTheDocument()
    expect(getByText('{{messagePlatform}}')).toBeInTheDocument()
    expect(getByText('Nov 2, 3:20 AM')).toBeInTheDocument()
  })

  it('shows textResponseSubmissionEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={textResponseSubmissionEvent} />
    )
    expect(getByText('Text submitted:')).toBeInTheDocument()
    expect(
      getByText('How do you feel about your adventure?')
    ).toBeInTheDocument()
    expect(
      getByText(
        'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.'
      )
    ).toBeInTheDocument()
  })

  it('shows buttonClickEvent for navigateAction', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={buttonClickNavigateEvent} />
    )
    expect(getByText('Button click:')).toBeInTheDocument()
    expect(getByText('Next Card')).toBeInTheDocument()
    expect(getByText('Navigate Action')).toBeInTheDocument()
  })

  it('shows buttonClickEvent for navigateToBlockAction', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={buttonClickNavigateToBlockEvent} />
    )
    expect(getByText('Button click:')).toBeInTheDocument()
    expect(getByText('Selected Card')).toBeInTheDocument()
    expect(getByText('Navigate To Block Action')).toBeInTheDocument()
  })

  it('shows buttonClickEvent for navigateToJourneyAction', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={buttonClickNavigateToJourneyEvent} />
    )
    expect(getByText('Button click:')).toBeInTheDocument()
    expect(getByText('Journey')).toBeInTheDocument()
    expect(getByText('Navigate To Journey Action')).toBeInTheDocument()
  })

  it('shows buttonClickEvent for LinkAction', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={buttonClickLinkEvent} />
    )
    expect(getByText('Button click:')).toBeInTheDocument()
    expect(getByText('https://google.com')).toBeInTheDocument()
    expect(getByText('Link Action')).toBeInTheDocument()
  })

  it('shows signUpSubmissionEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={signUpSubmissionEvent} />
    )
    expect(getByText('Form submitted:')).toBeInTheDocument()
    expect(getByText('Sign Up Submission')).toBeInTheDocument()
    expect(
      getByText('Bilbo Bagginsbilbo.baggins@example.com')
    ).toBeInTheDocument()
  })

  it('shows radioQuestionSubmissionEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={radioQuestionSubmissionEvent} />
    )
    expect(getByText('Poll:')).toBeInTheDocument()
    expect(getByText('How do you feel about your journey?')).toBeInTheDocument()
    expect(getByText('10/10 would do it again')).toBeInTheDocument()
  })

  it('shows stepNextEvent', () => {
    const { getByText } = render(<TimelineEvent timelineItem={stepNextEvent} />)
    expect(getByText('Skip Step:')).toBeInTheDocument()
    expect(getByText('Current step block name')).toBeInTheDocument()
    expect(getByText('Next StepBlock Name')).toBeInTheDocument()
  })

  it('shows stepViewEvent', () => {
    const { getByText } = render(<TimelineEvent timelineItem={stepViewEvent} />)
    expect(getByText('Next Step')).toBeInTheDocument()
    expect(getByText('Current StepBlock Name')).toBeInTheDocument()
  })

  it('shows videoStartEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={videoStartEvent} />
    )
    expect(getByText('Video Start')).toBeInTheDocument()
    expect(getByText('JESUS internal')).toBeInTheDocument()
  })

  it('shows videoPlayEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={videoPlayEvent} />
    )
    expect(getByText('Video Play')).toBeInTheDocument()
    expect(getByText('JESUS internal')).toBeInTheDocument()
  })

  it('shows videoPauseEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={videoPauseEvent} />
    )
    expect(getByText('Video Pause')).toBeInTheDocument()
    expect(getByText('JESUS internal paused at 0:04')).toBeInTheDocument()
  })

  it('shows videoProgressEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={videoProgressEvent} />
    )
    expect(getByText('Video Progress 50%')).toBeInTheDocument()
    expect(getByText('JESUS youtube')).toBeInTheDocument()
  })

  it('shows videoExpandEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={videoExpandEvent} />
    )
    expect(
      getByText('Video expanded to fullscreen at (0:08)')
    ).toBeInTheDocument()
    expect(getByText('JESUS youtube')).toBeInTheDocument()
  })

  it('shows videoCompleteEvent', () => {
    const { getByText } = render(
      <TimelineEvent timelineItem={videoCompleteEvent} />
    )
    expect(getByText('Video completed')).toBeInTheDocument()
    expect(getByText('JESUS youtube')).toBeInTheDocument()
  })
})
