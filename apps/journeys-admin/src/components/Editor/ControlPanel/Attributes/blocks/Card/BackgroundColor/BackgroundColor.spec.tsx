import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../../libs/context'
import {
  BackgroundColor,
  CARD_BLOCK_BACKGROUND_COLOR_UPDATE
} from './BackgroundColor'

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
  userJourneys: [],
  seoTitle: null,
  seoDescription: null
}

describe('CardStyling', () => {
  it('shows default ', () => {
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
      children: []
    }

    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={journey}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <BackgroundColor />
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByTestId('bgColorTextField').children[0].children[1].getAttribute(
        'value'
      )
    ).toEqual('Default')
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
      children: []
    }
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'journeyId',
      locked: false,
      nextBlockId: null,
      parentOrder: 0,
      children: [card]
    }
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={journey}>
            <EditorProvider initialState={{ selectedBlock: step }}>
              <BackgroundColor />
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByTestId('bgColorTextField').children[0].children[1].getAttribute(
        'value'
      )
    ).toEqual('Default')
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
        cardBlockUpdate: { id: 'card1.id', backgroundColor: '#DCDDE5' }
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
      children: []
    }
    const { getByTestId } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_BACKGROUND_COLOR_UPDATE,
              variables: {
                id: 'card1.id',
                journeyId: 'journeyId',
                input: {
                  backgroundColor: '#DCDDE5'
                }
              }
            },
            result
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider value={journey}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <BackgroundColor />
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('#DCDDE5'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
