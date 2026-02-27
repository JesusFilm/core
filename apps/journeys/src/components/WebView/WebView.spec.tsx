import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../__generated__/globalTypes'
import {
  JourneyViewEventCreate,
  JourneyViewEventCreateVariables
} from '../../../__generated__/JourneyViewEventCreate'
import { StepFields } from '../../../__generated__/StepFields'
import {
  StepViewEventCreate,
  StepViewEventCreateVariables
} from '../../../__generated__/StepViewEventCreate'
import {
  VisitorUpdateForCurrentUser,
  VisitorUpdateForCurrentUserVariables
} from '../../../__generated__/VisitorUpdateForCurrentUser'
import { basic, videoBlocks } from '../../libs/testData/storyData'
import {
  JOURNEY_VIEW_EVENT_CREATE,
  JOURNEY_VISITOR_UPDATE
} from '../Conductor/Conductor'

import { WebView } from '.'

jest.mock('@core/shared/ui/useBreakpoints', () => ({
  __esModule: true,
  useBreakpoints: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

global.fetch = jest.fn(
  async () =>
    await Promise.resolve({
      json: async () =>
        await Promise.resolve({
          city: 'Blenheim',
          region: 'Marlborough',
          country: 'New Zealand'
        })
    })
) as jest.Mock

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('WebView', () => {
  beforeEach(() => {
    const useBreakpointsMock = useBreakpoints as jest.Mock
    useBreakpointsMock.mockReturnValue({
      xs: false,
      sm: false,
      md: false,
      lg: false,
      xl: true
    })
  })

  const visitorUpdateMock: MockedResponse<
    VisitorUpdateForCurrentUser,
    VisitorUpdateForCurrentUserVariables
  > = {
    request: {
      query: JOURNEY_VISITOR_UPDATE,
      variables: {
        input: {
          countryCode: 'Blenheim, Marlborough, New Zealand',
          referrer: undefined
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        visitorUpdateForCurrentUser: { id: 'uuid', __typename: 'Visitor' }
      }
    }))
  }

  const journeyViewEventMock: MockedResponse<
    JourneyViewEventCreate,
    JourneyViewEventCreateVariables
  > = {
    request: {
      query: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          journeyId: 'journeyId',
          label: 'my journey',
          value: '529'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyViewEventCreate: {
          id: 'uuid',
          __typename: 'JourneyViewEvent'
        }
      }
    }))
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    title: 'my journey',
    language: {
      __typename: 'Language',
      id: '529'
    }
  } as unknown as Journey

  it('should create analytics event', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    mockUuidv4.mockReturnValueOnce('stepId')

    const mockStepViewEventCreate: MockedResponse<
      StepViewEventCreate,
      StepViewEventCreateVariables
    > = {
      request: {
        query: STEP_VIEW_EVENT_CREATE,
        variables: {
          input: {
            id: 'stepId',
            blockId: 'step1.id',
            value: 'Step 1'
          }
        }
      },
      result: {
        data: {
          stepViewEventCreate: {
            id: 'stepId',
            __typename: 'StepViewEvent'
          }
        }
      }
    }

    render(
      <MockedProvider
        mocks={[
          visitorUpdateMock,
          journeyViewEventMock,
          mockStepViewEventCreate
        ]}
      >
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <SnackbarProvider>
            <WebView
              blocks={basic}
              stepBlock={basic[0] as TreeBlock<StepFields>}
            />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(journeyViewEventMock.result).toHaveBeenCalled())
    expect(visitorUpdateMock.result).toHaveBeenCalled()
    expect(mockedSendGTMEvent).toHaveBeenCalledWith({
      event: 'journey_view',
      journeyId: 'journeyId',
      eventId: 'uuid',
      journeyTitle: 'my journey'
    })
  })

  it('should render block', () => {
    render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey }}>
          <SnackbarProvider>
            <WebView
              blocks={basic}
              stepBlock={basic[0] as TreeBlock<StepFields>}
            />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('JourneysStepHeader')).toBeInTheDocument()
    expect(screen.getByTestId('JourneysStepFooter')).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('should not render step footer if there is a video block', () => {
    render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey }}>
          <SnackbarProvider>
            <WebView
              blocks={videoBlocks}
              stepBlock={videoBlocks[0] as TreeBlock<StepFields>}
            />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.queryByTestId('JourneysStepFooter')).not.toBeInTheDocument()
  })

  it('should render step footer if there is a background video block', () => {
    const backgroundVideoBlocks: TreeBlock[] = [
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        slug: null,
        children: [
          {
            id: 'card1.id',
            __typename: 'CardBlock',
            parentBlockId: 'step1.id',
            parentOrder: 0,
            backgroundColor: null,
            backdropBlur: null,
            coverBlockId: 'video1.id',
            themeMode: null,
            themeName: null,
            fullscreen: false,
            eventLabel: null,
            children: [
              {
                id: 'video1.id',
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                autoplay: true,
                muted: true,
                videoId: '5I69DCxYbBg',
                videoVariantLanguageId: null,
                source: VideoBlockSource.youTube,
                title: null,
                description: null,
                duration: null,
                image: null,
                mediaVideo: {
                  __typename: 'YouTube',
                  id: '5I69DCxYbBg'
                },
                endAt: null,
                startAt: 0,
                posterBlockId: null,
                fullsize: true,
                action: null,
                objectFit: null,
                showGeneratedSubtitles: null,
                subtitleLanguage: null,
                eventLabel: null,
                endEventLabel: null,
                customizable: null,
                children: []
              }
            ]
          }
        ]
      }
    ]
    render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey }}>
          <SnackbarProvider>
            <WebView
              blocks={backgroundVideoBlocks}
              stepBlock={backgroundVideoBlocks[0] as TreeBlock<StepFields>}
            />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('JourneysStepFooter')).toBeInTheDocument()
  })

  it('should have active-card class for fullscreen support', () => {
    render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey }}>
          <SnackbarProvider>
            <WebView
              blocks={basic}
              stepBlock={basic[0] as TreeBlock<StepFields>}
            />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const activeCard = document.querySelector('.active-card')
    expect(activeCard).toBeInTheDocument()
  })
})
