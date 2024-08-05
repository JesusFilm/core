import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { getVisitorEvents } from './utils/data'
import { GET_VISITOR_EVENTS } from './VisitorJourneysList'

import { VisitorJourneysList } from '.'

describe('JourneyList', () => {
  it('should get visitor events', async () => {
    const result = jest.fn(() => ({
      data: getVisitorEvents
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VISITOR_EVENTS,
              variables: {
                id: 'visitorId'
              }
            },
            result
          }
        ]}
      >
        <VisitorJourneysList id="visitorId" />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
