import { fireEvent, render } from '@testing-library/react'

import { journey } from '../utils/data'

import { EventsCard } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('EventsCard', () => {
  it('should show card header', () => {
    const { getByRole } = render(<EventsCard journey={journey} />)
    expect(
      getByRole('heading', {
        name: 'Lord of the Rings November 2, 2022'
      })
    ).toBeInTheDocument()
  })

  it('should show collapsed events', () => {
    const { getByText, getByRole } = render(<EventsCard journey={journey} />)

    // JourneyViewEvent
    expect(
      getByRole('heading', { name: 'Journey Started' })
    ).toBeInTheDocument()
    // ChatOpenedEvent
    expect(getByRole('heading', { name: 'Nov 2, 3:20 AM' })).toBeInTheDocument()
    // TextResponseEvent
    expect(
      getByRole('heading', {
        name: 'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.'
      })
    ).toBeInTheDocument()
    // ButtonClick
    expect(
      getByRole('heading', { name: 'Navigate Action' })
    ).toBeInTheDocument()
    // RadioQuestionSubmissionEvent
    expect(
      getByRole('heading', { name: '10/10 would do it again' })
    ).toBeInTheDocument()
    // SignUpEvent
    expect(
      getByRole('heading', { name: '10/10 would do it again' })
    ).toBeInTheDocument()

    // Compact events
    expect(getByText('8 more events')).toBeInTheDocument()
  })

  it('should show expanded events', () => {
    const { getByRole, getByText, queryByRole } = render(
      <EventsCard journey={journey} />
    )
    fireEvent.click(getByRole('button', { name: '8 more events' }))
    expect(
      queryByRole('button', { name: '8 more events' })
    ).not.toBeInTheDocument()

    // StepNextEvent
    expect(getByText('Next StepBlock Name')).toBeInTheDocument()
    // StepViewEvent
    expect(getByText('Current StepBlock Name')).toBeInTheDocument()
    // VideoStartEvent
    expect(getByText('Video Start')).toBeInTheDocument()
    // VideoPlayEvent
    expect(getByText('Video Play')).toBeInTheDocument()
    // VideoPauseEvent
    expect(getByText('Video Pause')).toBeInTheDocument()
    // VideoProgressEvent
    expect(getByText('Video Progress 50%')).toBeInTheDocument()
    // VideoExpandEvent
    expect(
      getByText('Video expanded to fullscreen at (0:08)')
    ).toBeInTheDocument()
    // VideoCompleteEvent
    expect(getByText('Video completed')).toBeInTheDocument()
  })
})
