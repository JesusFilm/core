import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { JourneyImageBlockDelete } from '../../../__generated__/JourneyImageBlockDelete'

import {
  JOURNEY_IMAGE_BLOCK_DELETE,
  useJourneyImageBlockDeleteMutation
} from './useJourneyImageBlockDeleteMutation'

describe('useJourneyImageBlockDeleteMutation', () => {
  const journeyImageBlockDeleteMutationMock: MockedResponse<JourneyImageBlockDelete> =
    {
      request: {
        query: JOURNEY_IMAGE_BLOCK_DELETE,
        variables: {
          id: 'imageBlockId',
          journeyId: 'journeyId'
        }
      },
      result: jest.fn(() => ({
        data: {
          blockDelete: [
            {
              __typename: 'ImageBlock',
              id: 'imageBlockId',
              parentOrder: 0
            }
          ]
        }
      }))
    }

  it('should delete image block', async () => {
    const { result } = renderHook(() => useJourneyImageBlockDeleteMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[journeyImageBlockDeleteMutationMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            id: 'imageBlockId',
            journeyId: 'journeyId'
          }
        })
        expect(journeyImageBlockDeleteMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})
