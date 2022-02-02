import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { CARD_BLOCK_UPDATE } from '../CardBlockUpdate'
import { JourneyProvider } from '../../../../../../../libs/context'
import { CardLayout } from '.'

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

describe('CardLayout', () => {
  it('shows Contained ', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardLayout />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Contained')).toBeInTheDocument()
  })

  it('shows Expanded', () => {
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: ThemeMode.dark,
      themeName: null,
      fullscreen: true,
      children: []
    }
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardLayout />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Expanded')).toBeInTheDocument()
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
        block: { id: 'card1.id', fullscreen: true }
      }
    }))
    const card: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const { getByTestId } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_UPDATE,
              variables: {
                id: 'card1.id',
                journeyId: 'journeyId',
                input: {
                  fullscreen: true
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock: card }}>
            <CardLayout />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('true'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
