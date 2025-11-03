import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { useMenuBlockRestoreMutation } from './useMenuBlockRestoreMutation'
import { mockUseMenuBlockRestoreMutation } from './useMenuBlockRestoreMutation.mock'

describe('useMenuBlockRestoreMutation', () => {
  const input = {
    variables: {
      journeyId: defaultJourney.id,
      stepId: 'step.id',
      journeyUpdateInput: {
        menuStepBlockId: 'step.id'
      }
    }
  }

  it('should create menu', async () => {
    const { result } = renderHook(() => useMenuBlockRestoreMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[mockUseMenuBlockRestoreMutation]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider>{children}</EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](input)

      expect(mockUseMenuBlockRestoreMutation.result).toHaveBeenCalled()
    })
  })

  it('should update cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [],
        id: 'journey-id',
        __typename: 'Journey'
      }
    })

    const { result } = renderHook(() => useMenuBlockRestoreMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[mockUseMenuBlockRestoreMutation]} cache={cache}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider>{children}</EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](input)

      await waitFor(() =>
        expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
          { __ref: 'StepBlock:step.id' }
        ])
      )
    })
  })
})
