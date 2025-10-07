import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { CARD_BLOCK_THEME_MODE_UPDATE, CardStyling } from './CardStyling'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const initialBlock: TreeBlock<CardBlock> = {
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

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  title: 'my journey',
  slug: 'my-journey',
  strategySlug: null,
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
  template: null,
  userJourneys: [],
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

describe('CardStyling', () => {
  it('shows default', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: initialBlock }}>
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.queryByTestId('selected')).not.toBeInTheDocument()
  })

  it('shows dark', async () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.dark,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('selected').children[0]).toHaveAttribute(
      'alt',
      'Dark'
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
      themeMode: ThemeMode.dark,
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
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('selected').children[0]).toHaveAttribute(
      'alt',
      'Dark'
    )
  })

  it('shows light', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.light,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('selected').children[0]).toHaveAttribute(
      'alt',
      'Light'
    )
  })

  it('should check if the mutation gets called', async () => {
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
        cardBlockUpdate: {
          id: 'card1.id',
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base,
          __typename: 'CardBlock'
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_THEME_MODE_UPDATE,
              variables: {
                id: 'card1.id',
                input: {
                  themeMode: ThemeMode.dark,
                  themeName: ThemeName.base
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock: initialBlock }}>
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByTestId('Dark'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo a styling change', async () => {
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
        cardBlockUpdate: {
          id: 'card1.id',
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base,
          __typename: 'CardBlock'
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_THEME_MODE_UPDATE,
              variables: {
                id: 'card1.id',
                input: {
                  themeMode: ThemeMode.dark,
                  themeName: ThemeName.base
                }
              }
            },
            result
          },
          {
            request: {
              query: CARD_BLOCK_THEME_MODE_UPDATE,
              variables: {
                id: 'card1.id',
                input: { themeMode: 'light', themeName: 'base' }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider
            initialState={{
              selectedBlock: { ...initialBlock, themeMode: ThemeMode.light }
            }}
          >
            <CardStyling />
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByTestId('Dark'))
    await waitFor(() => expect(result).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result).toHaveBeenCalledTimes(2))
  })
})
