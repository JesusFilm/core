import { render, waitFor, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { JourneyProvider } from '../../../../../../libs/context'
import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey
} from '../../../../../../../__generated__/GetJourney'
import {
  NavigateToJourneyAction,
  GET_JOURNEY_NAMES,
  NAVIGATE_TO_JOURNEY_ACTION_UPDATE
} from './NavigateToJourneyAction'

describe('NavigateToJourneyAction', () => {
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
        <NavigateToJourneyAction />
      </MockedProvider>
    )
    expect(getByText('Select the Journey...')).toBeInTheDocument()
  })

  it('displays selected journey', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'button.id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: {
        parentBlockId: 'button.id',
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
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock }}>
            <NavigateToJourneyAction />
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
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        blockUpdateNavigateToJourneyAction: {
          id: 'journeyId',
          slug: 'my-journey',
          journeyId: 'journeyId',
          gtmEventName: 'gtmEventName',
          journey: {
            id: journey.id,
            slug: 'my-journey'
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
      >
        <JourneyProvider value={journey}>
          <EditorProvider initialState={{ selectedBlock }}>
            <NavigateToJourneyAction />
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
