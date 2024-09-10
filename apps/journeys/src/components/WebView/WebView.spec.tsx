import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { STEP_VIEW_EVENT_CREATE } from '@core/journeys/ui/Step/Step'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
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
import { basic } from '../../libs/testData/storyData'
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

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
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
    expect(mockedDataLayer).toHaveBeenCalledWith({
      dataLayer: {
        event: 'journey_view',
        journeyId: 'journeyId',
        eventId: 'uuid',
        journeyTitle: 'my journey'
      }
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
})
