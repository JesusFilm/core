import { MockedResponse } from '@apollo/client/testing'

import { JourneyImageBlockCreate } from '../../../__generated__/JourneyImageBlockCreate'
import { JOURNEY_IMAGE_BLOCK_CREATE } from './useJourneyImageBlockCreateMutation'

export const journeyImageBlockCreateMock: MockedResponse<JourneyImageBlockCreate> =
  {
    request: {
      query: JOURNEY_IMAGE_BLOCK_CREATE,
      variables: {
        input: {
          journeyId: 'journeyId',
          src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
          alt: 'journey image'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        imageBlockCreate: {
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
