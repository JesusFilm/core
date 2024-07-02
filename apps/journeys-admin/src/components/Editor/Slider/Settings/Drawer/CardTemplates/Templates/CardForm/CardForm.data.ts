import type { MockedResponse } from '@apollo/client/testing'

import type {
  CardFormCreate,
  CardFormCreateVariables
} from '../../../../../../../../../__generated__/CardFormCreate'
import {
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

import { CARD_FORM_CREATE } from './CardForm'

const cardFormCreate: CardFormCreate = {
  image: {
    id: 'imageId',
    parentBlockId: 'cardId',
    parentOrder: null,
    src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
    alt: 'photo-1488048924544-c818a467dacd',
    width: 5184,
    height: 3456,
    blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
    __typename: 'ImageBlock'
  },
  subtitle: {
    id: 'subtitleId',
    parentBlockId: 'cardId',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'Prayer Request',
    variant: TypographyVariant.h6,
    __typename: 'TypographyBlock'
  },
  title: {
    id: 'titleId',
    parentBlockId: 'cardId',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'How can we pray for you?',
    variant: TypographyVariant.h1,
    __typename: 'TypographyBlock'
  },
  textResponse: {
    id: 'textResponseId',
    parentBlockId: 'cardId',
    parentOrder: 2,
    label: 'Your answer here',
    hint: null,
    minRows: null,
    __typename: 'TextResponseBlock'
  },
  body: {
    id: 'bodyId',
    parentBlockId: 'cardId',
    parentOrder: 3,
    align: null,
    color: TypographyColor.secondary,
    content:
      "Each day, we pray for those in our city. We'd be grateful to include your personal needs.",
    variant: TypographyVariant.caption,
    __typename: 'TypographyBlock'
  },
  cardBlockUpdate: {
    id: 'cardId',
    parentBlockId: 'stepId',
    parentOrder: 0,
    backgroundColor: null,
    coverBlockId: 'imageId',
    themeMode: null,
    themeName: null,
    fullscreen: true,
    __typename: 'CardBlock'
  }
}

const cardFormCreateVars: CardFormCreateVariables = {
  imageInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    alt: 'photo-1488048924544-c818a467dacd',
    blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
    height: 3456,
    src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
    width: 5184,
    isCover: true
  },
  subtitleInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content: 'Prayer Request',
    variant: TypographyVariant.h6
  },
  titleInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content: 'How can we pray for you?',
    variant: TypographyVariant.h1
  },
  textResponseInput: {
    id: 'textResponseId',
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    label: 'Your answer here'
  },
  bodyInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content:
      "Each day, we pray for those in our city. We'd be grateful to include your personal needs.",
    variant: TypographyVariant.caption,
    color: TypographyColor.secondary
  },
  journeyId: 'journeyId',
  cardId: 'cardId',
  cardInput: {
    fullscreen: true
  }
}

export const cardFormCreateMock: MockedResponse<
  CardFormCreate,
  CardFormCreateVariables
> = {
  request: {
    query: CARD_FORM_CREATE,
    variables: cardFormCreateVars
  },
  result: jest.fn(() => ({
    data: cardFormCreate
  }))
}

export const cardFormCreateErrorMock: MockedResponse<
  CardFormCreate,
  CardFormCreateVariables
> = {
  request: {
    query: CARD_FORM_CREATE,
    variables: cardFormCreateVars
  },
  error: {
    name: 'INTERNAL_SERVER_ERROR',
    message: 'There was an error creating form card'
  }
}
