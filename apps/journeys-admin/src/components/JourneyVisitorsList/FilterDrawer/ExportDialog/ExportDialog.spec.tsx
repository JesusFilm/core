import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  CreateEventsExportLog,
  CreateEventsExportLogVariables
} from '../../../../../__generated__/CreateEventsExportLog'
import {
  GetJourneyCreatedAt,
  GetJourneyCreatedAtVariables
} from '../../../../../__generated__/GetJourneyCreatedAt'
import {
  GetJourneyEvents,
  GetJourneyEventsVariables
} from '../../../../../__generated__/GetJourneyEvents'
import { EventType } from '../../../../../__generated__/globalTypes'
import {
  CREATE_EVENTS_EXPORT_LOG,
  GET_JOURNEY_EVENTS_EXPORT
} from '../../../../libs/useJourneyEventsExport/useJourneyEventsExport'
import { getMockGetJourneyEventsCountQuery } from '../../../../libs/useJourneyEventsExport/useJourneyEventsExport.mock'
import { FILTERED_EVENTS } from '../../../../libs/useJourneyEventsExport/utils/constants'

import { ExportDialog, GET_JOURNEY_CREATED_AT } from './ExportDialog'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const mockOnClose = jest.fn()

const journeyCreatedAt = '2023-01-01T00:00:00.000Z'
const mockJourneyCreatedAt: MockedResponse<
  GetJourneyCreatedAt,
  GetJourneyCreatedAtVariables
> = {
  request: {
    query: GET_JOURNEY_CREATED_AT,
    variables: { id: 'journey1' }
  },
  result: {
    data: {
      journey: {
        id: 'journey1',
        createdAt: journeyCreatedAt,
        __typename: 'Journey'
      }
    }
  }
}

const mockGetJourneyEventsCountQuery = getMockGetJourneyEventsCountQuery({
  journeyId: 'journey1',
  filter: {
    typenames: FILTERED_EVENTS,
    periodRangeStart: journeyCreatedAt,
    periodRangeEnd: '2023-12-31T00:00:00.000Z'
  }
})

const defaultProps = {
  open: true,
  onClose: mockOnClose,
  journeyId: 'journey1'
}

describe('ExportDialog', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2023-12-31T00:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const getJourneyEventsMock: MockedResponse<
    GetJourneyEvents,
    GetJourneyEventsVariables
  > = {
    request: {
      query: GET_JOURNEY_EVENTS_EXPORT,
      variables: {
        journeyId: 'journey1',
        filter: {
          typenames: FILTERED_EVENTS,
          periodRangeStart: journeyCreatedAt,
          periodRangeEnd: '2023-12-31T00:00:00.000Z'
        },
        after: null,
        first: 20000
      }
    },
    result: {
      data: {
        journeyEventsConnection: {
          __typename: 'JourneyEventsConnection',
          edges: [
            {
              __typename: 'JourneyEventEdge',
              cursor: 'cursor1',
              node: {
                __typename: 'JourneyEvent',
                journeyId: '123',
                visitorId: 'visitor.id',
                label: 'Test',
                value: 'Test',
                typename: 'StepViewEvent',
                progress: null,
                journeySlug: 'test-journey',
                visitorName: 'Test User',
                visitorEmail: 'test@example.com',
                visitorPhone: '1234567890',
                createdAt: '2023-01-01T00:00:00.000Z'
              }
            },
            {
              __typename: 'JourneyEventEdge',
              cursor: 'cursor2',
              node: {
                __typename: 'JourneyEvent',
                journeyId: '123',
                label: 'Test',
                value: 'Test',
                progress: null,
                typename: 'StepViewEvent',
                visitorId: 'visitor.id',
                journeySlug: 'test-journey',
                visitorName: 'Test User',
                visitorEmail: 'test@example.com',
                visitorPhone: '1234567890',
                createdAt: '2023-01-01T00:00:00.000Z'
              }
            }
          ],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'cursor1',
            endCursor: 'cursor2',
            __typename: 'PageInfo'
          }
        }
      }
    }
  }

  const eventTypes = [
    EventType.JourneyViewEvent,
    EventType.ChatOpenEvent,
    EventType.TextResponseSubmissionEvent,
    EventType.RadioQuestionSubmissionEvent,
    EventType.ButtonClickEvent,
    EventType.SignUpSubmissionEvent,
    EventType.VideoStartEvent,
    EventType.VideoPlayEvent,
    EventType.VideoPauseEvent,
    EventType.VideoCompleteEvent,
    EventType.VideoProgressEvent
  ]

  const mockCreateEventsExportLogMutation: MockedResponse<
    CreateEventsExportLog,
    CreateEventsExportLogVariables
  > = {
    request: {
      query: CREATE_EVENTS_EXPORT_LOG,
      variables: {
        input: {
          journeyId: 'journey1',
          eventsFilter: eventTypes,
          dateRangeStart: '2023-01-01T00:00:00.000Z',
          dateRangeEnd: '2023-12-31T00:00:00.000Z'
        }
      }
    },
    result: {
      data: {
        createJourneyEventsExportLog: {
          __typename: 'JourneyEventsExportLog',
          id: '123'
        }
      }
    }
  }

  it('should render correctly with initial state', async () => {
    render(
      <MockedProvider
        mocks={[
          mockGetJourneyEventsCountQuery,
          mockJourneyCreatedAt,
          getJourneyEventsMock
        ]}
      >
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    // Select "Visitor Actions" to show the FilterForm
    const selectElement = screen.getByRole('combobox')
    fireEvent.mouseDown(selectElement)
    fireEvent.click(screen.getByText('Visitor Actions'))

    expect(screen.getByLabelText('All')).toBeChecked()
    expect(screen.getByLabelText('Journey Start')).toBeChecked()
    expect(screen.getByRole('button', { name: 'Export (CSV)' })).toBeEnabled()
  })

  it('should call export function with default filters on button click', async () => {
    const mockExportJourneyEventsResult = jest.fn(() => ({
      ...getJourneyEventsMock.result
    }))
    const mockJourneyCreatedAtResult = jest.fn(() => ({
      ...mockJourneyCreatedAt.result
    }))

    render(
      <MockedProvider
        mocks={[
          mockGetJourneyEventsCountQuery,
          mockCreateEventsExportLogMutation,
          { ...mockJourneyCreatedAt, result: mockJourneyCreatedAtResult },
          { ...getJourneyEventsMock, result: mockExportJourneyEventsResult }
        ]}
      >
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(async () => {
      expect(mockJourneyCreatedAtResult).toHaveBeenCalled()
    })
    
    // Select "Visitor Actions" to show the FilterForm
    const selectElement = screen.getByRole('combobox')
    fireEvent.mouseDown(selectElement)
    fireEvent.click(screen.getByText('Visitor Actions'))
    
    const exportButton = screen.getByRole('button', { name: 'Export (CSV)' })
    await act(async () => {
      fireEvent.click(exportButton)
    })
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    await waitFor(() => {
      expect(mockExportJourneyEventsResult).toHaveBeenCalled()
    })
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should disable export button when no events are selected', async () => {
    render(
      <MockedProvider mocks={[mockJourneyCreatedAt]}>
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    // Select "Visitor Actions" to show the FilterForm
    const selectElement = screen.getByRole('combobox')
    fireEvent.mouseDown(selectElement)
    fireEvent.click(screen.getByText('Visitor Actions'))

    const allCheckbox = screen.getByLabelText('All')
    const exportButton = screen.getByRole('button', { name: 'Export (CSV)' })

    expect(exportButton).toBeEnabled()
    fireEvent.click(allCheckbox)
    expect(exportButton).toBeDisabled()

    fireEvent.click(screen.getByLabelText('Journey Start'))
    expect(exportButton).toBeEnabled()
  })

  it('should show error snackbar when export fails', async () => {
    const getJourneyEventsMockError = {
      request: getJourneyEventsMock.request,
      error: new Error(
        'error message comes from the useJourneyEventsExport hook'
      )
    }

    const mockJourneyCreatedAtResult = jest.fn(() => ({
      ...mockJourneyCreatedAt.result
    }))

    render(
      <MockedProvider
        mocks={[
          { ...mockJourneyCreatedAt, result: mockJourneyCreatedAtResult },
          getJourneyEventsMockError
        ]}
      >
        <SnackbarProvider>
          <ExportDialog {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(async () => {
      expect(mockJourneyCreatedAtResult).toHaveBeenCalled()
    })

    // Select "Visitor Actions" to show the FilterForm
    const selectElement = screen.getByRole('combobox')
    fireEvent.mouseDown(selectElement)
    fireEvent.click(screen.getByText('Visitor Actions'))

    const exportButton = screen.getByRole('button', { name: 'Export (CSV)' })

    await act(async () => {
      fireEvent.click(exportButton)
    })

    await waitFor(() => {
      expect(
        screen.getByText('Failed to retrieve data for export.')
      ).toBeInTheDocument()
    })
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
