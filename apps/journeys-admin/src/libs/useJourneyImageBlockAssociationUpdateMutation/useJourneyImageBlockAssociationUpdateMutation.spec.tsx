import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { JourneyImageBlockAssociationUpdate } from '../../../__generated__/JourneyImageBlockAssociationUpdate'

import {
  JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
  useJourneyImageBlockAssociationUpdateMutation
} from './useJourneyImageBlockAssociationUpdateMutation'

describe('useJourneyImageBlockAssociationUpdateMutation', () => {
  const journeyImageBlockAssociationUpdateMutationMock: MockedResponse<JourneyImageBlockAssociationUpdate> =
    {
      request: {
        query: JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
        variables: {
          id: 'journeyId',
          input: {
            primaryImageBlockId: 'imageBlockId'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyUpdate: {
            __typename: 'Journey',
            id: 'journeyId',
            primaryImageBlock: {
              __typename: 'ImageBlock',
              id: 'imageBlockId'
            },
            creatorImageBlock: null
          }
        }
      }))
    }

  it('should update journey image block association', async () => {
    const { result } = renderHook(
      () => useJourneyImageBlockAssociationUpdateMutation(),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[journeyImageBlockAssociationUpdateMutationMock]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            id: 'journeyId',
            input: {
              primaryImageBlockId: 'imageBlockId'
            }
          }
        })
        expect(
          journeyImageBlockAssociationUpdateMutationMock.result
        ).toHaveBeenCalled()
      })
    })
  })

  it('should update creator image block association', async () => {
    const creatorImageBlockAssociationMock: MockedResponse<JourneyImageBlockAssociationUpdate> =
      {
        request: {
          query: JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
          variables: {
            id: 'journeyId',
            input: {
              creatorImageBlockId: 'creatorImageBlockId'
            }
          }
        },
        result: jest.fn(() => ({
          data: {
            journeyUpdate: {
              __typename: 'Journey',
              id: 'journeyId',
              primaryImageBlock: null,
              creatorImageBlock: {
                __typename: 'ImageBlock',
                id: 'creatorImageBlockId'
              }
            }
          }
        }))
      }

    const { result } = renderHook(
      () => useJourneyImageBlockAssociationUpdateMutation(),
      {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[creatorImageBlockAssociationMock]}>
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            id: 'journeyId',
            input: {
              creatorImageBlockId: 'creatorImageBlockId'
            }
          }
        })
        expect(creatorImageBlockAssociationMock.result).toHaveBeenCalled()
      })
    })
  })
})
