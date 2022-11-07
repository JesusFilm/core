import { render, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { useVisitorInfo, VisitorInfoProvider } from '../VisitorInfoProvider'
import { JourneyWithEvents } from '../transformVisitorEvents'
import { getVisitorEventsMock } from './VisitorJourneyListData'
import { VisitorJourneyList } from '.'

describe('VisitorJourneyList', () => {
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

  it('does not set journey on VisitorInfoContext if journey set', async () => {
    const { getByText } = render(
      <VisitorInfoProvider initialState={{ journey }}>
        <MockedProvider mocks={[getVisitorEventsMock]}>
          <VisitorJourneyList id="visitorId" />
        </MockedProvider>
        <JourneyId />
      </VisitorInfoProvider>
    )
    await waitFor(() =>
      expect(getByText('A Journey: There and Back Again')).toBeInTheDocument()
    )
    expect(getByText('journeyId')).toBeInTheDocument()
  })

  it('sets journey on VisitorInfoContext if none set', async () => {
    const { getByText } = render(
      <VisitorInfoProvider>
        <MockedProvider mocks={[getVisitorEventsMock]}>
          <VisitorJourneyList id="visitorId" />
        </MockedProvider>
        <JourneyId />
      </VisitorInfoProvider>
    )
    await waitFor(() => expect(getByText('journeyId1')).toBeInTheDocument())
  })

  it('shows journeys up to limit', async () => {
    const { getByText, queryByText } = render(
      <VisitorInfoProvider>
        <MockedProvider mocks={[getVisitorEventsMock]}>
          <VisitorJourneyList id="visitorId" limit={1} />
        </MockedProvider>
      </VisitorInfoProvider>
    )
    await waitFor(() =>
      expect(getByText('A Journey: There and Back Again')).toBeInTheDocument()
    )
    expect(queryByText('Lord of the Rings')).not.toBeInTheDocument()
  })
})
