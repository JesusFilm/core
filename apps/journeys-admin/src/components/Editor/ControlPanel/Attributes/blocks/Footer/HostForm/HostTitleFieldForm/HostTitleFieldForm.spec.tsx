import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { InMemoryCache } from '@apollo/client'
import { useHostUpdate } from '../../../../../../../../libs/useHostUpdate'
import { UPDATE_HOST } from '../../../../../../../../libs/useHostUpdate/useHostUpdate'
import {
  CREATE_HOST,
  HostTitleFieldForm,
  UPDATE_JOURNEY_HOST
} from './HostTitleFieldForm'

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

describe('HostTitleFieldForm', () => {
  const host = {
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
    host
  } as unknown as Journey

  it('should create a host on submit if no host exists', async () => {
    const cache = new InMemoryCache()
    cache.restore({})

    const host = {
      id: 'hostId',
      title: 'host title'
    }

    const result = jest.fn(() => ({
      data: {
        hostCreate: host
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: host.id
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CREATE_HOST,
              variables: {
                teamId: 'jfp-team',
                input: {
                  title: 'Host title'
                }
              }
            },
            result
          },
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: host.id
                }
              }
            },
            result: result2
          }
        ]}
      >
        <JourneyProvider value={{ journey: { ...journey, host: null } }}>
          <HostTitleFieldForm />
        </JourneyProvider>
      </MockedProvider>
    )

    const field = getByRole('textbox', { name: 'Host Name' })

    fireEvent.click(field)
    fireEvent.change(field, { target: { value: 'Host title' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
    expect(cache.extract()['Host:hostId']).toEqual({
      ...host,
      title: 'Host title'
    })
  })

  it('should update host title on submit if host exists', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Host:hostId': host
    })

    const result = jest.fn(() => ({
      data: {
        hostUpdate: {
          __typename: 'Host',
          id: 'hostId',
          title: 'Host title',
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
                  title: 'Host title'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <HostTitleFieldForm />
        </JourneyProvider>
      </MockedProvider>
    )

    const field = getByRole('textbox', { name: 'Host Name' })

    expect(field).toHaveValue(journey.host?.title)

    fireEvent.click(field)
    fireEvent.change(field, { target: { value: 'Host title' } })
    fireEvent.blur(field)

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Host:hostId']).toEqual({
      ...host,
      title: 'Host title'
    })
  })
})
