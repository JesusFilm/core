import type { MockedResponse } from '@apollo/client/testing'

import type {
  CardIntroCreate,
  CardIntroCreateVariables
} from '../../../../../../../../../__generated__/CardIntroCreate'
import {
  ButtonVariant,
  IconName,
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'

import { CARD_INTRO_CREATE } from './CardIntro'

const cardIntroCreate: CardIntroCreate = {
  subtitle: {
    id: 'subtitleId',
    parentBlockId: 'cardId',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'Interactive Video',
    variant: TypographyVariant.h6,
    __typename: 'TypographyBlock'
  },
  title: {
    id: 'titleId',
    parentBlockId: 'cardId',
    parentOrder: 1,
    align: null,
    color: null,
    content: "Jesus: History's Most Influential Figure?",
    variant: TypographyVariant.h1,
    __typename: 'TypographyBlock'
  },
  body: {
    id: 'bodyId',
    parentBlockId: 'cardId',
    parentOrder: 2,
    align: null,
    color: null,
    content:
      'Journey through time, from dusty roads to modern cities, to understand the lasting impact and relevance of Jesus.',
    variant: TypographyVariant.body1,
    __typename: 'TypographyBlock'
  },
  button: {
    id: 'buttonId',
    parentBlockId: 'cardId',
    parentOrder: 3,
    label: 'Begin the Journey',
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null,
    __typename: 'ButtonBlock'
  },
  startIcon: {
    id: 'startIconId',
    parentBlockId: 'buttonId',
    parentOrder: null,
    iconName: null,
    iconSize: null,
    iconColor: null,
    __typename: 'IconBlock'
  },
  endIcon: {
    id: 'endIconId',
    parentBlockId: 'buttonId',
    parentOrder: null,
    iconName: IconName.ArrowForwardRounded,
    iconSize: null,
    iconColor: null,
    __typename: 'IconBlock'
  },
  buttonBlockUpdate: {
    id: 'buttonId',
    parentBlockId: 'cardId',
    parentOrder: 3,
    label: 'Begin the Journey',
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: null,
    startIconId: 'startIconId',
    endIconId: 'endIconId',
    action: null,
    __typename: 'ButtonBlock'
  },
  video: {
    id: 'videoId',
    parentBlockId: 'cardId',
    parentOrder: null,
    muted: null,
    autoplay: null,
    startAt: 2048,
    endAt: 2058,
    posterBlockId: null,
    fullsize: null,
    videoId: '1_jf-0-0',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    video: {
      id: '1_jf-0-0',
      title: [
        {
          value: 'JESUS',
          __typename: 'Translation'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg?version=2',
      variant: {
        id: '1_529-jf-0-0',
        hls: 'https://arc.gt/j67rz',
        __typename: 'VideoVariant'
      },
      variantLanguages: [],
      __typename: 'Video'
    },
    action: null,
    __typename: 'VideoBlock'
  }
}

const cardIntroCreateVars: CardIntroCreateVariables = {
  journeyId: 'journeyId',
  buttonId: 'buttonId',
  subtitleInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content: 'Interactive Video',
    variant: TypographyVariant.h6
  },
  titleInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content: "Jesus: History's Most Influential Figure?",
    variant: TypographyVariant.h1
  },
  bodyInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content:
      'Journey through time, from dusty roads to modern cities, to understand the lasting impact and relevance of Jesus.',
    variant: TypographyVariant.body1
  },
  buttonInput: {
    id: 'buttonId',
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    label: 'Begin the Journey',
    variant: ButtonVariant.contained
  },
  startIconInput: {
    id: 'startIconId',
    journeyId: 'journeyId',
    parentBlockId: 'buttonId'
  },
  endIconInput: {
    id: 'endIconId',
    journeyId: 'journeyId',
    parentBlockId: 'buttonId',
    name: IconName.ArrowForwardRounded
  },
  buttonUpdateInput: {
    startIconId: 'startIconId',
    endIconId: 'endIconId'
  },
  videoInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    videoId: '1_jf-0-0',
    videoVariantLanguageId: '529',
    startAt: 2048,
    endAt: 2058,
    isCover: true,
    source: VideoBlockSource.internal
  }
}

export const cardIntroCreateMock: MockedResponse<
  CardIntroCreate,
  CardIntroCreateVariables
> = {
  request: {
    query: CARD_INTRO_CREATE,
    variables: cardIntroCreateVars
  },
  result: jest.fn(() => ({
    data: cardIntroCreate
  }))
}

export const cardIntroCreateErrorMock: MockedResponse<
  CardIntroCreate,
  CardIntroCreateVariables
> = {
  request: {
    query: CARD_INTRO_CREATE,
    variables: cardIntroCreateVars
  },
  error: {
    name: 'INTERNAL_SERVER_ERROR',
    message: 'There was an error creating intro card'
  }
}
