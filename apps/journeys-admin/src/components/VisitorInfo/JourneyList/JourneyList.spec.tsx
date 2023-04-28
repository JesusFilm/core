import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VISITOR_EVENTS } from './JourneyList'
import { getVisitorEvents } from './utils/data'
import { JourneyList } from '.'

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
        <JourneyList id="visitorId" />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
