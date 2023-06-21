import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { InMemoryCache } from '@apollo/client'
import { useHostUpdate } from '../../../../../../../../libs/useHostUpdate'
import { UPDATE_HOST } from '../../../../../../../../libs/useHostUpdate/useHostUpdate'
import { HostLocationFieldForm } from './HostLocationFieldForm'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('../../../../../../../../libs/useHostUpdate', () => ({
  __esModule: true,
  useHostUpdate: jest.fn()
}))

const mockUseHostUpdate = useHostUpdate as jest.MockedFunction<
  typeof useHostUpdate
>

const updateHost = jest.fn()
beforeEach(() => {
  mockUseHostUpdate.mockReturnValue({
    updateHost
  })
})
afterEach(() => {
  jest.resetAllMocks()
})

describe('HostLocationFieldForm', () => {
  const defaultHost = {
    id: 'hostId',
    __typename: 'Host',
    teamId: 'teamId',
    title: 'Cru International',
    location: null,
    src1: null,
    src2: null
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost
  } as unknown as Journey

  it('should update host location on submit', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Host:hostId': defaultHost
    })

    const result = jest.fn(() => ({
      data: {
        hostUpdate: {
          __typename: 'Host',
          id: 'hostId',
          title: 'Cru International',
          location: null,
          src1: null,
          src2: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: UPDATE_HOST,
              variables: {
                id: 'hostId',
                teamId: 'teamId',
                input: {
                  location: 'Florida, USA'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <HostLocationFieldForm />
        </JourneyProvider>
      </MockedProvider>
    )

    const field = getByRole('textbox', { name: 'Location' })

    expect(field).toHaveValue('')

    fireEvent.change(field, { target: { value: 'Florida, USA' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result).toHaveBeenCalled())

    void waitFor(() =>
      expect(cache.extract()['Host:hostId']).toEqual({
        ...defaultHost,
        location: 'Florida, USA'
      })
    )
  })
})
