import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { CARD_BLOCK_LAYOUT_UPDATE, CardLayout } from './CardLayout'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  strategySlug: null,
  featuredAt: null,
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null,
  socialNodeX: null,
  socialNodeY: null
}

describe('CardLayout', () => {
  it('shows Contained', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardLayout />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('selected').children[0]).toHaveAttribute(
      'alt',
      'Contained'
    )
  })

  it('shows Expanded', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.dark,
      themeName: null,
      fullscreen: true,
      backdropBlur: null,
      children: []
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardLayout />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('selected').children[0]).toHaveAttribute(
      'alt',
      'Expanded'
    )
  })

  it('works in a step block', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      locked: false,
      nextBlockId: null,
      parentOrder: 0,
      slug: null,
      children: [card]
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: step }}>
            <CardLayout />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('selected').children[0]).toHaveAttribute(
      'alt',
      'Contained'
    )
  })

  it('changes to gql selection', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'CardBlock:card1.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const result = jest.fn(() => ({
      data: {
        cardBlockUpdate: { id: 'card1.id', fullscreen: true }
      }
    }))
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
    render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_LAYOUT_UPDATE,
              variables: {
                id: 'card1.id',
                input: {
                  fullscreen: true
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock: card }}>
          <CardLayout />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByTestId('true'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('undoes changes to layout', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'CardBlock:card1.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const result = jest.fn(() => ({
      data: {
        cardBlockUpdate: { id: 'card1.id', fullscreen: true }
      }
    }))
    const result2 = jest.fn(() => ({
      data: {
        cardBlockUpdate: { id: 'card1.id', fullscreen: false }
      }
    }))
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
    render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_LAYOUT_UPDATE,
              variables: { id: 'card1.id', input: { fullscreen: true } }
            },
            result
          },
          {
            request: {
              query: CARD_BLOCK_LAYOUT_UPDATE,
              variables: {
                id: 'card1.id',
                input: {
                  fullscreen: false
                }
              }
            },
            result: result2
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock: card }}>
          <CommandUndoItem variant="button" />
          <CardLayout />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByTestId('true'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('prevents clicking expanded layout when card contains video block', async () => {
    const videoBlock = {
      id: 'video1.id',
      __typename: 'VideoBlock'
    } as unknown as TreeBlock<VideoBlock>
    const card = {
      id: 'card1.id',
      __typename: 'CardBlock',
      fullscreen: false,
      children: [videoBlock]
    } as unknown as TreeBlock<CardBlock>

    const result = jest.fn(() => ({
      data: {
        cardBlockUpdate: { id: 'card1.id', fullscreen: true }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CARD_BLOCK_LAYOUT_UPDATE,
              variables: {
                id: 'card1.id',
                input: {
                  fullscreen: true
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardLayout disableExpanded />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const expandedBox = screen.getByTestId('true')
    expect(expandedBox).toHaveStyle({
      opacity: '0.3',
      filter: 'grayscale(100%)'
    })
    expect(expandedBox).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(expandedBox)
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })
})
