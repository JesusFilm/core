import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../../libs/context'
import { CardStyling, CARD_BLOCK_THEME_UPDATE } from './CardStyling'

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
  children: []
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  locale: 'en-US',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: []
}

describe('CardStyling', () => {
  it('shows default ', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock: initialBlock }}>
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Default')).toBeInTheDocument()
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
      children: []
    }
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Dark')).toBeInTheDocument()
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
      children: []
    }
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Light')).toBeInTheDocument()
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
        block: {
          id: 'card1.id',
          themeMode: ThemeMode.dark,
          __typename: 'CardBlock'
        }
      }
    }))

    const { getByTestId } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_THEME_UPDATE,
              variables: {
                id: 'card1.id',
                journeyId: 'journeyId',
                input: {
                  themeMode: ThemeMode.dark
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock: initialBlock }}>
            <CardStyling />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('Dark'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
