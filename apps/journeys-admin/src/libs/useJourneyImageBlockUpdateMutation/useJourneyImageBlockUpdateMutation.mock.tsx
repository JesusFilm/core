import { MockedResponse } from '@apollo/client/testing'

import { JourneyImageBlockUpdate } from '../../../__generated__/JourneyImageBlockUpdate'
import { JOURNEY_IMAGE_BLOCK_UPDATE } from './useJourneyImageBlockUpdateMutation'

export const journeyImageBlockUpdateMock: MockedResponse<JourneyImageBlockUpdate> =
  {
    request: {
      query: JOURNEY_IMAGE_BLOCK_UPDATE,
      variables: {
        id: 'imageBlockId',
        journeyId: 'journeyId',
        input: {
          src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
          alt: 'journey image'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        imageBlockUpdate: {
          __typename: 'ImageBlock',
          id: 'imageBlockId',
          parentBlockId: null,
          parentOrder: 0,
          src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
          alt: 'journey image',
          width: 1920,
          height: 1080,
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
          scale: null,
          focalTop: null,
          focalLeft: null
        }
      }
    }))
  }
