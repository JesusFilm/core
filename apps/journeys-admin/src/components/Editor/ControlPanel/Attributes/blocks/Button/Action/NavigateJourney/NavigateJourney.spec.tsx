import { render, waitFor, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { JourneyProvider } from '../../../../../../../../libs/context'
import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../../../../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../../__generated__/GetJourney'
import {
  NavigateJourney,
  GET_JOURNEYS_NAMES,
  NAVIGATE_TO_JOURNEY_ACTION_UPDATE
} from './NavigateJourney'

describe('NavigateJourney', () => {
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

  it('displays text when no journey is selected', () => {
    const { getByText } = render(
      <MockedProvider>
        <NavigateJourney />
      </MockedProvider>
    )
    expect(getByText('Select the Journey...')).toBeInTheDocument()
  })

  it('displays selected journey', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'journeyId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: {
        __typename: 'NavigateToJourneyAction',
        gtmEventName: 'gtmEventName',
        journey: {
          __typename: 'Journey',
          id: 'journeyId',
          slug: 'my-journey'
        }
      },
      children: []
    }
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEYS_NAMES
            },
            result: {
              data: {
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
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock }}>
            <NavigateJourney />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByText('my journey')).toBeInTheDocument())
  })

  it('changes the journey on action', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'journeyId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: null,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        blockUpdateNavigateToJourneyAction: {
          id: 'journeyId',
          action: {
            journeyId: 'journeyId',
            journey: {
              id: journey.id
            }
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEYS_NAMES
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
      >
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock }}>
            <NavigateJourney />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'journey-name-select' }))
    await waitFor(() =>
      expect(
        getByRole('option', { name: 'testJourneyName' })
      ).toBeInTheDocument()
    )
    fireEvent.click(getByRole('option', { name: 'testJourneyName' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
