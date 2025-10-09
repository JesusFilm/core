import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { JourneyImageBlockUpdate } from '../../../__generated__/JourneyImageBlockUpdate'

import {
  JOURNEY_IMAGE_BLOCK_UPDATE,
  useJourneyImageBlockUpdateMutation
} from './useJourneyImageBlockUpdateMutation'

describe('useJourneyImageBlockUpdateMutation', () => {
  const journeyImageBlockUpdateMutationMock: MockedResponse<JourneyImageBlockUpdate> =
    {
      request: {
        query: JOURNEY_IMAGE_BLOCK_UPDATE,
        variables: {
          id: 'imageBlockId',
          journeyId: 'journeyId',
          input: {
            src: 'https://example.com/updated-image.jpg',
            alt: 'Updated test image',
            width: 1000,
            height: 800,
            blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
            scale: 1.2,
            focalTop: 0.3,
            focalLeft: 0.7
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            __typename: 'ImageBlock',
            id: 'imageBlockId',
            parentBlockId: 'parentBlockId',
            parentOrder: 0,
            src: 'https://example.com/updated-image.jpg',
            alt: 'Updated test image',
            width: 1000,
            height: 800,
            blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
            scale: 1.2,
            focalTop: 0.3,
            focalLeft: 0.7
          }
        }
      }))
    }

  it('should update image block', async () => {
    const { result } = renderHook(() => useJourneyImageBlockUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[journeyImageBlockUpdateMutationMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            id: 'imageBlockId',
            journeyId: 'journeyId',
            input: {
              src: 'https://example.com/updated-image.jpg',
              alt: 'Updated test image',
              width: 1000,
              height: 800,
              blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
              scale: 1.2,
              focalTop: 0.3,
              focalLeft: 0.7
            }
          }
        })
        expect(journeyImageBlockUpdateMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})
