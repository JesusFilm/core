import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { steps } from '../data'

import {
  GET_JOURNEY_NAMES,
  NAVIGATE_TO_JOURNEY_ACTION_UPDATE,
  NavigateToJourneyAction
} from './NavigateToJourneyAction'

describe('NavigateToJourneyAction', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    slug: 'my-journey',
    strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view',
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

  it('shows no journey selected by default', () => {
    const { getByText } = render(
      <MockedProvider>
        <NavigateToJourneyAction />
      </MockedProvider>
    )
    expect(getByText('Select the Journey...')).toBeInTheDocument()
  })

  it('displays selected journey', async () => {
    const selectedBlock = steps[0].children[0].children[3]
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_NAMES
            },
            result: {
              data: {
                gtmEventName: 'gtmEventName',
                journeys: [
                  {
                    id: 'journeyId',
                    title: 'my journey'
                  }
                ]
              }
            }
          }
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <NavigateToJourneyAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByText('my journey')).toBeInTheDocument())
  })

  it('changes the journey on action', async () => {
    const selectedBlock = steps[1].children[0].children[3]

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'ButtonBlock:button1.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'ButtonBlock:button1.id': {
        ...selectedBlock
      }
    })

    const result = jest.fn(() => ({
      data: {
        blockUpdateNavigateToJourneyAction: {
          id: 'journeyId',
          slug: 'my-journey',
          journeyId: 'journeyId',
          gtmEventName: 'gtmEventName',
          journey: {
            id: 'testJourneyId',
            slug: 'test-journey'
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_NAMES
            },
            result: {
              data: {
                journeys: [
                  {
                    id: 'testJourneyId',
                    title: 'testJourneyName'
                  }
                ]
              }
            }
          },
          {
            request: {
              query: NAVIGATE_TO_JOURNEY_ACTION_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: journey.id,
                input: {
                  journeyId: 'testJourneyId'
                }
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <NavigateToJourneyAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'journey' }))
    await waitFor(() =>
      expect(
        getByRole('option', { name: 'testJourneyName' })
      ).toBeInTheDocument()
    )
    fireEvent.click(getByRole('option', { name: 'testJourneyName' }))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      journey: {
        id: 'testJourneyId',
        slug: 'test-journey'
      }
    })
  })
})
