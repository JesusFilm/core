import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../__generated__/BlockFields'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'

import { wrappedNavigateToBlockActionUpdateMock } from './useWrappedNavigateToBlockActionUpdateMutation.mock'

import { useWrappedNavigateToBlockActionUpdateMutation } from '.'

describe('useWrappedNavigateToBlockActionUpdateMutation', () => {
  const journey = {
    id: 'journey-id'
  } as unknown as Journey

  const block1: ButtonBlock = {
    __typename: 'ButtonBlock',
    id: 'block1.id',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    label: 'button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null
  }

  it('should update block action', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(wrappedNavigateToBlockActionUpdateMock.result)

    const { result } = renderHook(
      () => useWrappedNavigateToBlockActionUpdateMutation(),
      {
        wrapper: ({ children }) => (
          <JourneyProvider value={{ journey }}>
            <MockedProvider
              mocks={[
                {
                  ...wrappedNavigateToBlockActionUpdateMock,
                  result: mockResult
                }
              ]}
            >
              {children}
            </MockedProvider>
          </JourneyProvider>
        )
      }
    )

    await act(async () => {
      await result.current[0](block1, 'step2.id')

      expect(mockResult).toHaveBeenCalled()
    })
  })
})
