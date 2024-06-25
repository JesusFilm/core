import type { MockedResponse } from '@apollo/client/testing'

import type {
  CardQuoteCreate,
  CardQuoteCreateVariables
} from '../../../../../../../../../__generated__/CardQuoteCreate'
import {
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

import { CARD_QUOTE_CREATE } from './CardQuote'

const cardQuoteCreate: CardQuoteCreate = {
  image: {
    id: 'imageId',
    parentBlockId: 'cardId',
    parentOrder: null,
    src: 'https://images.unsplash.com/photo-1552423310-ba74b8de5e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyOXx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDg5M3ww&ixlib=rb-4.0.3&q=80&w=1080',
    alt: 'photo-1552423310-ba74b8de5e6f',
    width: 5094,
    height: 3396,
    blurhash: 'L99*0;01IAtk5R%MRie;t8D%-pa$',
    __typename: 'ImageBlock'
  },
  subtitle: {
    id: 'subtitleId',
    parentBlockId: 'cardId',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'The Bible Says:',
    variant: TypographyVariant.h6,
    __typename: 'TypographyBlock'
  },
  title: {
    id: 'titleId',
    parentBlockId: 'cardId',
    parentOrder: 1,
    align: null,
    color: null,
    content:
      'Blessed are the peacemakers, for they shall be called sons of God.',
    variant: TypographyVariant.h3,
    __typename: 'TypographyBlock'
  },
  body: {
    id: 'bodyId',
    parentBlockId: 'cardId',
    parentOrder: 2,
    align: null,
    color: TypographyColor.secondary,
    content: '– Jesus Christ',
    variant: TypographyVariant.body1,
    __typename: 'TypographyBlock'
  },
  cardBlockUpdate: {
    id: 'cardId',
    parentBlockId: 'stepId',
    parentOrder: 0,
    backgroundColor: '#0E1412',
    coverBlockId: 'imageId',
    themeMode: null,
    themeName: null,
    fullscreen: false,
    __typename: 'CardBlock'
  }
}

const cardQuoteCreateVars: CardQuoteCreateVariables = {
  imageInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    alt: 'photo-1552423310-ba74b8de5e6f',
    blurhash: 'L99*0;01IAtk5R%MRie;t8D%-pa$',
    height: 3396,
    src: 'https://images.unsplash.com/photo-1552423310-ba74b8de5e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyOXx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDg5M3ww&ixlib=rb-4.0.3&q=80&w=1080',
    width: 5094,
    isCover: true
  },
  subtitleInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content: 'The Bible Says:',
    variant: TypographyVariant.h6
  },
  titleInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content:
      'Blessed are the peacemakers, for they shall be called sons of God.',
    variant: TypographyVariant.h3
  },
  bodyInput: {
    journeyId: 'journeyId',
    parentBlockId: 'cardId',
    content: '– Jesus Christ',
    variant: TypographyVariant.body1,
    color: TypographyColor.secondary
  },
  cardId: 'cardId',
  cardInput: {
    backgroundColor: '#0E1412'
  }
}

export const cardQuoteCreateMock: MockedResponse<
  CardQuoteCreate,
  CardQuoteCreateVariables
> = {
  request: {
    query: CARD_QUOTE_CREATE,
    variables: cardQuoteCreateVars
  },
  result: jest.fn(() => ({
    data: cardQuoteCreate
  }))
}

export const cardQuoteCreateErrorMock: MockedResponse<
  CardQuoteCreate,
  CardQuoteCreateVariables
> = {
  request: {
    query: CARD_QUOTE_CREATE,
    variables: cardQuoteCreateVars
  },
  error: {
    name: 'INTERNAL_SERVER_ERROR',
    message: 'There was an error creating cta card'
  }
}
