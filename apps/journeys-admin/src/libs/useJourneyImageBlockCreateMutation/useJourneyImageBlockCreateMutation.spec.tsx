import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { JourneyImageBlockCreate } from '../../../__generated__/JourneyImageBlockCreate'

import {
  JOURNEY_IMAGE_BLOCK_CREATE,
  useJourneyImageBlockCreateMutation
} from './useJourneyImageBlockCreateMutation'

describe('useJourneyImageBlockCreateMutation', () => {
  const journeyImageBlockCreateMutationMock: MockedResponse<JourneyImageBlockCreate> =
    {
      request: {
        query: JOURNEY_IMAGE_BLOCK_CREATE,
        variables: {
          input: {
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            src: 'https://example.com/image.jpg',
            alt: 'Test image',
            width: 800,
            height: 600,
            blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
            scale: 1,
            focalTop: 0.5,
            focalLeft: 0.5
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          imageBlockCreate: {
            __typename: 'ImageBlock',
            id: 'imageBlockId',
            parentBlockId: 'parentBlockId',
            parentOrder: 0,
            src: 'https://example.com/image.jpg',
            alt: 'Test image',
            width: 800,
            height: 600,
            blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
            scale: 1,
            focalTop: 0.5,
            focalLeft: 0.5
          }
        }
      }))
    }

  it('should create image block', async () => {
    const { result } = renderHook(() => useJourneyImageBlockCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[journeyImageBlockCreateMutationMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            input: {
              journeyId: 'journeyId',
              parentBlockId: 'parentBlockId',
              src: 'https://example.com/image.jpg',
              alt: 'Test image',
              width: 800,
              height: 600,
              blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
              scale: 1,
              focalTop: 0.5,
              focalLeft: 0.5
            }
          }
        })
        expect(journeyImageBlockCreateMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})
