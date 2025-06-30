import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  CardQuoteCreate,
  CardQuoteCreateVariables
} from '../../../../../../../../../__generated__/CardQuoteCreate'
import {
  CardQuoteDelete,
  CardQuoteDeleteVariables
} from '../../../../../../../../../__generated__/CardQuoteDelete'
import {
  CardQuoteRestore,
  CardQuoteRestoreVariables
} from '../../../../../../../../../__generated__/CardQuoteRestore'
import {
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import {
  CARD_QUOTE_CREATE,
  CARD_QUOTE_DELETE,
  CARD_QUOTE_RESTORE
} from './CardQuote'

import { CardQuote } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

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
  backdropBlur: null,
  children: []
}
const step: TreeBlock = {
  id: 'stepId',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  slug: null,
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
        id: 'imageId',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        alt: 'photo-1552423310-ba74b8de5e6f',
        blurhash: 'L99*0;01IAtk5R%MRie;t8D%-pa$',
        height: 3396,
        src: 'https://images.unsplash.com/photo-1552423310-ba74b8de5e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyOXx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDg5M3ww&ixlib=rb-4.0.3&q=80&w=1080',
        width: 5094,
        isCover: true,
        scale: null,
        focalLeft: 50,
        focalTop: 50
      },
      subtitleInput: {
        id: 'subtitleId',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        content: 'The Bible Says:',
        variant: TypographyVariant.h6,
        align: null,
        color: null
      },
      titleInput: {
        id: 'titleId',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        content:
          'Blessed are the peacemakers, for they shall be called sons of God.',
        variant: TypographyVariant.h3,
        align: null,
        color: null
      },
      bodyInput: {
        id: 'bodyId',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        content: '– Jesus Christ',
        variant: TypographyVariant.body1,
        align: null,
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
        __typename: 'ImageBlock',
        scale: null,
        focalLeft: 50,
        focalTop: 50
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
        backdropBlur: null,
        __typename: 'CardBlock'
      }
    }
  }
}

const cardQuoteMockDelete: MockedResponse<
  CardQuoteDelete,
  CardQuoteDeleteVariables
> = {
  request: {
    query: CARD_QUOTE_DELETE,
    variables: {
      imageId: 'imageId',
      subtitleId: 'subtitleId',
      titleId: 'titleId',
      bodyId: 'bodyId',
      cardId: 'cardId',
      cardInput: { backgroundColor: null }
    }
  },
  result: {
    data: {
      image: [],
      subtitle: [],
      title: [],
      body: [],
      cardBlockUpdate: card
    }
  }
}

const cardQuoteMockRestore: MockedResponse<
  CardQuoteRestore,
  CardQuoteRestoreVariables
> = {
  request: {
    query: CARD_QUOTE_RESTORE,
    variables: {
      imageId: 'imageId',
      subtitleId: 'subtitleId',
      titleId: 'titleId',
      bodyId: 'bodyId',
      cardId: 'cardId',
      cardInput: { backgroundColor: '#0E1412' }
    }
  },
  result: {
    data: {
      image: [],
      subtitle: [],
      title: [],
      body: [],
      cardBlockUpdate: card
    }
  }
}

describe('CardQuote', () => {
  it('updates card content and updates local cache', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('bodyId')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardQuoteCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardQuote />
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

  it('should undo a card quote', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('bodyId')

    const result = jest.fn().mockResolvedValue(cardQuoteCreateMock.result)
    const result2 = jest.fn().mockResolvedValue(cardQuoteMockDelete.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardQuoteCreateMock, result },
          { ...cardQuoteMockDelete, result: result2 }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardQuote />
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Quote Template' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => {
      expect(result2).toHaveBeenCalled()
    })
  })

  it('should redo a card quote', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('bodyId')

    const result = jest.fn().mockResolvedValue(cardQuoteCreateMock.result)
    const result2 = jest.fn().mockResolvedValue(cardQuoteMockDelete.result)
    const result3 = jest.fn().mockResolvedValue(cardQuoteMockRestore.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardQuoteCreateMock, result },
          { ...cardQuoteMockDelete, result: result2 },
          { ...cardQuoteMockRestore, result: result3 }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardQuote />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Quote Template' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => {
      expect(result2).toHaveBeenCalled()
    })

    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => {
      expect(result3).toHaveBeenCalled()
    })
  })
})
