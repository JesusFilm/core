import type { MockedResponse } from '@apollo/client/testing'

import type {
  CardVideoCreate,
  CardVideoCreateVariables
} from '../../../../../../../../../__generated__/CardVideoCreate'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { CARD_VIDEO_CREATE } from './CardVideo'

const cardVideoCreate: CardVideoCreate = {
  video: {
    __typename: 'VideoBlock',
    id: 'videoBlockId',
    parentBlockId: 'cardId',
    parentOrder: 0,
    muted: false,
    autoplay: true,
    startAt: 2048,
    endAt: 2058,
    posterBlockId: null,
    fullsize: true,
    videoId: '1_jf-0-0',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    video: null,
    action: null
  }
}

const cardVideoCreateVars: CardVideoCreateVariables = {
  videoInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    videoId: '1_jf-0-0',
    videoVariantLanguageId: '529',
    startAt: 2048,
    endAt: 2058,
    autoplay: true,
    muted: false,
    source: VideoBlockSource.internal
  }
}

export const cardVideoCreateMock: MockedResponse<
  CardVideoCreate,
  CardVideoCreateVariables
> = {
  request: {
    query: CARD_VIDEO_CREATE,
    variables: cardVideoCreateVars
  },
  result: jest.fn(() => ({
    data: cardVideoCreate
  }))
}

export const cardVideoCreateErrorMock: MockedResponse<
  CardVideoCreate,
  CardVideoCreateVariables
> = {
  request: {
    query: CARD_VIDEO_CREATE,
    variables: cardVideoCreateVars
  },
  error: {
    name: 'INTERNAL_SERVER_ERROR',
    message: 'There was an error creating video card'
  }
}
