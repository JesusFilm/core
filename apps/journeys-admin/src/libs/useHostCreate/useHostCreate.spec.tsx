import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { JourneyFields } from '../../../__generated__/JourneyFields'
import { hostCreateMock } from '../useHostCreateMutation/useHostCreateMutation.mock'
import { updateJourneyHostMock } from '../useUpdateJourneyHostMutation/useUpdateJourneyHostMutation.mock'

import { useHostCreate } from './useHostCreate'

describe('useHostCreate', () => {
  it('should not create/update host when journey has no team', async () => {
    const mockCreateResult = jest.fn(() => ({
      ...hostCreateMock.result
    }))
    const mockJourneyUpdateResult = jest.fn(() => ({
      ...updateJourneyHostMock.result
    }))

    const { result } = renderHook(() => useHostCreate(), {
      wrapper: ({ children }) => (
        <JourneyProvider value={{ journey }}>
          <MockedProvider
            mocks={[
              { ...hostCreateMock, result: mockCreateResult },
              { ...updateJourneyHostMock, result: mockJourneyUpdateResult }
            ]}
          >
            {children}
          </MockedProvider>
        </JourneyProvider>
      )
    })

    await act(async () => {
      await result.current({ title: 'value' })
    })

    expect(mockCreateResult).not.toHaveBeenCalled()
    expect(mockJourneyUpdateResult).not.toHaveBeenCalled()
  })

  it('should create host when journey has team', async () => {
    const mockCreateResult = jest.fn(() => ({
      ...hostCreateMock.result
    }))
    const mockJourneyUpdateResult = jest.fn(() => ({
      ...updateJourneyHostMock.result
    }))

    const journeyWithTeam: JourneyFields = {
      ...journey,
      id: 'journeyId',
      team: {
        __typename: 'Team',
        id: 'team.id',
        title: 'value',
        publicTitle: 'Public Title'
      }
    }

    const { result } = renderHook(() => useHostCreate(), {
      wrapper: ({ children }) => (
        <JourneyProvider value={{ journey: journeyWithTeam }}>
          <MockedProvider
            mocks={[
              { ...hostCreateMock, result: mockCreateResult },
              { ...updateJourneyHostMock, result: mockJourneyUpdateResult }
            ]}
          >
            {children}
          </MockedProvider>
        </JourneyProvider>
      )
    })

    await act(async () => {
      await result.current({ title: 'value' })
    })

    expect(mockCreateResult).toHaveBeenCalled()
  })
})
