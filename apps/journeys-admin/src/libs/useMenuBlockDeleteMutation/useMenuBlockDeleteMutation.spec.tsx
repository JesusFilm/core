import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { useMenuBlockDeleteMutation } from './useMenuBlockDeleteMutation'
import { mockUseMenuBlockDeleteMutation } from './useMenuBlockDeleteMutation.mock'

describe('useMenuBlockDeleteMutation', () => {
  const input = {
    variables: {
      journeyId: defaultJourney.id,
      stepId: 'step.id',
      journeyUpdateInput: {
        menuStepBlockId: null
      }
    }
  }

  it('should create menu', async () => {
    const { result } = renderHook(() => useMenuBlockDeleteMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[mockUseMenuBlockDeleteMutation]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider>{children}</EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](input)

      expect(mockUseMenuBlockDeleteMutation.result).toHaveBeenCalled()
    })
  })
})
