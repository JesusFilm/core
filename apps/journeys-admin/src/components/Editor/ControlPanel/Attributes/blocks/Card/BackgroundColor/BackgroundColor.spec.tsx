import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import {
  BackgroundColor,
  CARD_BLOCK_BACKGROUND_COLOR_UPDATE
} from './BackgroundColor'

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  strategySlug: null,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null
}

describe('BackgroundColor', () => {
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

  it('shows the selected card color', () => {
    const { getByTestId, getByRole, getAllByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <BackgroundColor />
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByTestId('bg-color-#FEFEFE')).toHaveStyle({
      backgroundColor: '#FEFEFE'
    })
    expect(getByRole('textbox')).toHaveValue('#FEFEFE')

    // Palette picker
    expect(getAllByTestId('#FEFEFE')[0].parentElement).toHaveStyle({
      outline: '2px solid #C52D3A'
    })
    expect(getAllByTestId('#FEFEFE')[0]).toHaveStyle({
      backgroundColor: '#FEFEFE'
    })

    // Custom color picker tested via VR.
    // .react-colorful__pointer-fill always defaults to rgb(47, 47, 47)
  })

  it('changes color via palette picker', async () => {
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
        cardBlockUpdate: { id: 'card1.id', backgroundColor: '#283593' }
      }
    }))

    const { getAllByTestId } = render(
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
                  backgroundColor: '#B0BEC5'
                }
              }
            },
            result
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <EditorProvider initialState={{ selectedBlock: card }}>
              <BackgroundColor />
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getAllByTestId('#B0BEC5')[0])
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
