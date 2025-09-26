import { MockedResponse } from '@apollo/client/testing'

import { JourneyImageBlockAssociationUpdate } from '../../../__generated__/JourneyImageBlockAssociationUpdate'
import { JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE } from './useJourneyImageBlockAssociationUpdateMutation'

export const journeyImageBlockAssociationUpdateMock: MockedResponse<JourneyImageBlockAssociationUpdate> =
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
