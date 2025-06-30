import { MockedResponse } from '@apollo/client/testing'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  TextResponseType,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import { type TreeBlock } from '../../libs/block'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../libs/block/__generated__/BlockFields'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import {
  ButtonFields,
  ButtonFields_action_LinkAction as LinkAction
} from '../Button/__generated__/ButtonFields'
import { BUTTON_CLICK_EVENT_CREATE } from '../Button/Button'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { StepViewEventCreate } from '../Step/__generated__/StepViewEventCreate'
import { STEP_VIEW_EVENT_CREATE } from '../Step/Step'
import { TEXT_RESPONSE_SUBMISSION_EVENT_CREATE } from '../TextResponse/TextResponse'
import { VideoFields } from '../Video/__generated__/VideoFields'

import { StepNextEventCreate } from './__generated__/StepNextEventCreate'
import { StepPreviousEventCreate } from './__generated__/StepPreviousEventCreate'
import { STEP_NEXT_EVENT_CREATE, STEP_PREVIOUS_EVENT_CREATE } from './Card'

// Mock events
export const leftSide = { clientX: 0 }
export const rightSide = { clientX: 1000 }

// Blur image mock
export const mockBlurUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='

// Block definitions
export const step1: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step2.id',
  slug: null,
  children: []
}

export const step2: TreeBlock<StepBlock> = {
  id: 'step2.id',
  __typename: 'StepBlock',
  parentBlockId: 'card2.id',
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step3.id',
  slug: null,
  children: []
}

export const step3: TreeBlock<StepBlock> = {
  id: 'step3.id',
  __typename: 'StepBlock',
  parentBlockId: 'card3.id',
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: []
}

export const card1: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentOrder: 0,
  parentBlockId: null,
  backgroundColor: null,
  coverBlockId: null,
  themeName: null,
  themeMode: null,
  fullscreen: false,
  backdropBlur: null,
  children: [step1]
}

export const card2: TreeBlock<CardBlock> = {
  id: 'card2.id',
  __typename: 'CardBlock',
  parentOrder: 1,
  parentBlockId: null,
  backgroundColor: null,
  coverBlockId: null,
  themeName: null,
  themeMode: null,
  fullscreen: false,
  backdropBlur: null,
  children: [step2]
}

export const card3: TreeBlock<CardBlock> = {
  id: 'card3.id',
  __typename: 'CardBlock',
  parentOrder: 2,
  parentBlockId: null,
  backgroundColor: null,
  coverBlockId: null,
  themeName: null,
  themeMode: null,
  fullscreen: false,
  backdropBlur: null,
  children: [step3]
}

export const block: TreeBlock<CardBlock> = {
  __typename: 'CardBlock',
  id: 'card',
  parentBlockId: null,
  backgroundColor: null,
  coverBlockId: null,
  parentOrder: 0,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  children: [
    {
      id: 'typographyBlockId',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: null,
      color: null,
      content: 'How did we get here?',
      variant: null,
      children: []
    }
  ]
}

export const action: LinkAction = {
  __typename: 'LinkAction',
  parentBlockId: 'button',
  gtmEventName: null,
  url: 'https://test.com/some-site'
}

export const textResponseBlock: TreeBlock<TextResponseBlock> = {
  id: 'textResponseBlockId',
  __typename: 'TextResponseBlock',
  parentBlockId: null,
  parentOrder: 0,
  children: [],
  label: 'Text Response',
  placeholder: 'Enter your text',
  hint: 'This is a hint',
  minRows: 1,
  type: TextResponseType.freeForm,
  routeId: null,
  integrationId: null,
  required: null
}

export const imageBlock: TreeBlock<ImageFields> = {
  id: 'imageBlockId',
  __typename: 'ImageBlock',
  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
  alt: 'random image from unsplash',
  width: 1600,
  height: 1067,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
  parentBlockId: 'card',
  parentOrder: 0,
  scale: null,
  focalLeft: 50,
  focalTop: 50,
  children: []
}

export const buttonBlock: TreeBlock<ButtonFields> = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  parentOrder: 0,
  label: 'This is a button',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.small,
  startIconId: null,
  endIconId: null,
  action: action,
  submitEnabled: null,
  children: []
}

export const videoBlock: TreeBlock<VideoFields> = {
  __typename: 'VideoBlock',
  id: 'videoBlockId',
  parentBlockId: 'card',
  parentOrder: 0,
  muted: true,
  autoplay: true,
  startAt: null,
  endAt: null,
  posterBlockId: 'posterBlockId',
  fullsize: null,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: []
  },
  children: [
    {
      ...imageBlock,
      id: 'posterBlockId',
      alt: 'random image from unsplash - video',
      parentBlockId: 'videoBlockId'
    }
  ]
}

// Journey mock
export const journey = {
  id: 'journey.id',
  language: {
    bcp: 'en'
  }
} as unknown as Journey

// GraphQL mocks
export const mockStepPreviousEventCreate: MockedResponse<StepPreviousEventCreate> =
  {
    request: {
      query: STEP_PREVIOUS_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step2.id',
          previousStepId: 'step1.id',
          label: 'Step {{number}}',
          value: 'Step {{number}}'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        stepPreviousEventCreate: {
          id: 'uuid',
          __typename: 'StepPreviousEvent'
        }
      }
    }))
  }

export const mockStepNextEventCreate: MockedResponse<StepNextEventCreate> = {
  request: {
    query: STEP_NEXT_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'step1.id',
        nextStepId: 'step2.id',
        label: 'Step {{number}}',
        value: 'Step {{number}}'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      stepNextEventCreate: {
        id: 'uuid',
        __typename: 'StepNextEvent'
      }
    }
  }))
}

export const mockTextResponseSubmissionEventCreate = {
  request: {
    query: TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'textResponseBlockId',
        stepId: 'step1.id',
        label: 'Text Response',
        value: 'Test response'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseSubmissionEventCreate: {
        id: 'mocked-submission-id'
      }
    }
  }))
}

export const mockTextResponse1SubmissionEventCreate = {
  request: {
    query: TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'textResponse1',
        stepId: 'step1.id',
        label: 'Text Response 1',
        value: 'Test response for field 1'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseSubmissionEventCreate: {
        id: 'mocked-submission-id'
      }
    }
  }))
}

export const mockTextResponse2SubmissionEventCreate = {
  request: {
    query: TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'textResponse2',
        stepId: 'step1.id',
        label: 'Text Response 2',
        value: 'Test response for field 2'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseSubmissionEventCreate: {
        id: 'mocked-submission-id'
      }
    }
  }))
}

export const mockTextResponseEmailSubmissionEventCreate = {
  request: {
    query: TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'textResponse1',
        stepId: 'step1.id',
        label: 'Text Response 1',
        value: 'test@example.com'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseSubmissionEventCreate: {
        id: 'mocked-submission-id'
      }
    }
  }))
}

// Helper function for creating step view event mocks
export const getStepViewEventMock = (
  blockId: string,
  value?: string
): MockedResponse<StepViewEventCreate> => ({
  request: {
    query: STEP_VIEW_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId,
        value: value ?? 'Step {{number}}'
      }
    }
  },
  result: {
    data: {
      stepViewEventCreate: {
        id: 'uuid',
        __typename: 'StepViewEvent'
      }
    }
  }
})

// Create a mock for button click event
export const createMockButtonClickEvent = (
  blockId: string,
  stepId: string,
  buttonLabel: string,
  actionType: string,
  actionValue: string
) => ({
  request: {
    query: BUTTON_CLICK_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId,
        stepId,
        label: 'Step {{number}}',
        value: buttonLabel,
        action: actionType,
        actionValue
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      buttonClickEventCreate: {
        id: 'uuid',
        __typename: 'ButtonClickEvent'
      }
    }
  }))
})
