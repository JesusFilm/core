import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  CardQuoteCreate,
  CardQuoteCreateVariables
} from '../../../../../../__generated__/CardQuoteCreate'
import {
  TypographyColor,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../__generated__/JourneyFields'

import { CARD_QUOTE_CREATE } from './CardQuote'

import { CardQuote } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('CardQuote', () => {
  it('updates card content and updates local cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const card: TreeBlock = {
      id: 'cardId',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const step: TreeBlock = {
      id: 'stepId',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: [card]
    }
    const cardQuoteCreateMock: MockedResponse<
      CardQuoteCreate,
      CardQuoteCreateVariables
    > = {
      request: {
        query: CARD_QUOTE_CREATE,
        variables: {
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
      },
      result: {
        data: {
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
      }
    }
    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardQuoteCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardQuote onClick={jest.fn()} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Quote Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'ImageBlock:imageId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'TypographyBlock:bodyId' }
      ])
    })
  })
})
