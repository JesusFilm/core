import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'
import { JourneyWithEvents } from '../../transformVisitorEvents'
import { useVisitorInfo, VisitorInfoProvider } from '../../VisitorInfoProvider'
import { VisitorJourneyListItem } from './VisitorJourneyListItem'

describe('VisitorJourneyListItem', () => {
  const journey: JourneyWithEvents = {
    id: 'journeyId',
    title: 'A Journey: There and Back Again',
    createdAt: '2022-11-02T03:20:26.368Z',
    events: []
  }

  function JourneyId(): ReactElement {
    const {
      state: { journey }
    } = useVisitorInfo()

    return <>{journey?.id}</>
  }

  it('changes journey when View Timeline is clicked', () => {
    const { getByRole, queryByText, getByText } = render(
      <VisitorInfoProvider>
        <VisitorJourneyListItem journey={journey} />
        <JourneyId />
      </VisitorInfoProvider>
    )
    expect(queryByText('journeyId')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'View Timeline' }))
    expect(getByText('journeyId')).toBeInTheDocument()
  })
})
