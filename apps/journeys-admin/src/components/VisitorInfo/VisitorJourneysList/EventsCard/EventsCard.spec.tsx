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
    const { getByRole, getAllByText } = render(<EventsCard journey={journey} />)
    expect(
      getByRole('heading', {
        name: 'Lord of the Rings November 2, 2022'
      })
    ).toBeInTheDocument()
    expect(getAllByText('< 0:01')).toHaveLength(7)
  })

  it('should show collapsed events', () => {
    const { getByText, getByRole } = render(<EventsCard journey={journey} />)

    expect(
      getByRole('heading', { name: 'Chat started on {{messagePlatform}}' })
    ).toBeInTheDocument() // ChatOpenedEvent
    expect(
      getByRole('heading', {
        name: 'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.'
      })
    ).toBeInTheDocument() // TextResponseEvent
    expect(
      getByRole('heading', { name: '10/10 would do it again' })
    ).toBeInTheDocument() // RadioQuestionSubmissionEvent
    expect(
      getByRole('heading', { name: 'Journey Started' })
    ).toBeInTheDocument() // JourneyViewEvent

    expect(getByText('3 more events')).toBeInTheDocument() // Compact events
  })

  it('should show expanded events', () => {
    const { getByRole, queryByRole } = render(<EventsCard journey={journey} />)
    fireEvent.click(getByRole('button', { name: '3 more events' }))
    expect(
      queryByRole('button', { name: '3 more events' })
    ).not.toBeInTheDocument() // Compact events

    expect(
      getByRole('heading', { name: 'How will you remember the journey?' })
    ).toBeInTheDocument() // ButtonClickEvent
    expect(getByRole('heading', { name: 'JESUS youtube' })).toBeInTheDocument() // VideoCompleteEvent
    expect(getByRole('heading', { name: 'JESUS internal' })).toBeInTheDocument() // VideoStartEvent
    expect(
      getByRole('heading', { name: 'Bilbo Baggins bilbo.baggins@example.com' })
    ).toBeInTheDocument() // SignUpSubmissionEvent
  })
})
