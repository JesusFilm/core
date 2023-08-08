import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { useHostUpdate } from '../../../../../../../../../libs/useHostUpdate'
import { UPDATE_HOST } from '../../../../../../../../../libs/useHostUpdate/useHostUpdate'

import { HostLocationFieldForm } from './HostLocationFieldForm'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('../../../../../../../../../libs/useHostUpdate', () => ({
  __esModule: true,
  useHostUpdate: jest.fn()
}))

const mockUseHostUpdate = useHostUpdate as jest.MockedFunction<
  typeof useHostUpdate
>

describe('HostLocationFieldForm', () => {
  const updateHost = jest.fn()

  beforeEach(() => {
    mockUseHostUpdate.mockReturnValue({
      updateHost
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const defaultHost = {
    id: 'hostId',
    __typename: 'Host',
    teamId: 'teamId',
    title: 'Cru International',
    location: 'Florida, USA',
    src1: null,
    src2: null
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost
  } as unknown as Journey

  it('should populate the field with host location', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <HostLocationFieldForm />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('textbox', { name: 'Location' })).toHaveAttribute(
      'value',
      'Florida, USA'
    )
  })

  it('should clear the field', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <HostLocationFieldForm empty />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('textbox', { name: 'Location' })).toHaveAttribute(
      'value',
      ''
    )
  })

  it('should disable the field', () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <HostLocationFieldForm disabled />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('textbox', { name: 'Location' })).toBeDisabled()
  })

  it('should update host location on submit', () => {
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
          location: '',
          src1: null,
          src2: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: UPDATE_HOST,
              variables: {
                id: 'hostId',
                teamId: 'teamId',
                input: {
                  location: ''
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <HostLocationFieldForm />
        </JourneyProvider>
      </MockedProvider>
    )

    const field = getByRole('textbox', { name: 'Location' })

    expect(field).toHaveValue('Florida, USA')

    fireEvent.change(field, { target: { value: '' } })
    fireEvent.blur(field)

    void waitFor(() => expect(result).toHaveBeenCalled())
    void waitFor(() =>
      expect(cache.extract()['Host:hostId']).toEqual({
        ...defaultHost,
        location: 'Florida, USA'
      })
    )
  })
})
