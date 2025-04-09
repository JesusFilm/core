import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
  CreateEventsExportLog,
  CreateEventsExportLogVariables
} from '../../../__generated__/CreateEventsExportLog'
import {
  GetJourneyEvents,
  GetJourneyEventsVariables
} from '../../../__generated__/GetJourneyEvents'
import { EventType } from '../../../__generated__/globalTypes'

import {
  CREATE_EVENTS_EXPORT_LOG,
  FILTERED_EVENTS,
  GET_JOURNEY_EVENTS_EXPORT,
  useJourneyEventsExport
} from './useJourneyEventsExport'
import {
  mockCreateEventsExportLogMutation,
  mockGetJourneyEventsQuery
} from './useJourneyEventsExport.mock'

describe('useJourneyEventsExport', () => {
  const originalCreateElement = document.createElement
  const originalAppendChild = document.body.appendChild

  beforeEach(() => {
    jest.clearAllMocks()

    document.createElement = originalCreateElement
    document.body.appendChild = originalAppendChild
  })

  it('should export journey events to a CSV file when called', async () => {
    const queryResult = jest.fn(() => ({ ...mockGetJourneyEventsQuery.result }))
    const mutationResult = jest.fn(() => ({
      ...mockCreateEventsExportLogMutation.result
    }))

    const createElementSpy = jest.spyOn(document, 'createElement')
    const appendChildSpy = jest.spyOn(document.body, 'appendChild')
    const setAttributeSpy = jest.spyOn(
      HTMLAnchorElement.prototype,
      'setAttribute'
    )

    const { result } = renderHook(() => useJourneyEventsExport(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            { ...mockGetJourneyEventsQuery, result: queryResult },
            { ...mockCreateEventsExportLogMutation, result: mutationResult }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current.exportJourneyEvents({
        journeyId: 'journey1',
        filter: {}
      })
    })

    expect(queryResult).toHaveBeenCalled()
    await waitFor(() => expect(mutationResult).toHaveBeenCalled())

    // await waitFor(() =>
    expect(createElementSpy).toHaveBeenCalledWith('a')
    // )
    expect(setAttributeSpy).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}\] test-journey\.csv/)
    )
    expect(appendChildSpy).toHaveBeenCalled()
  })

  it('should handle pagination when multiple pages of data exist', async () => {
    const createElementSpy = jest.spyOn(document, 'createElement')
    const appendChildSpy = jest.spyOn(document.body, 'appendChild')
    const setAttributeSpy = jest.spyOn(
      HTMLAnchorElement.prototype,
      'setAttribute'
    )

    const mockGetJourneyEventsQueryPage1: MockedResponse<
      GetJourneyEvents,
      GetJourneyEventsVariables
    > = {
      request: {
        query: GET_JOURNEY_EVENTS_EXPORT,
        variables: {
          journeyId: 'journey1',
          filter: {
            typenames: ['ButtonClickEvent'],
            periodRangeStart: '2023-01-15T12:00:00Z',
            periodRangeEnd: '2024-01-15T12:00:00Z'
          },
          first: 20000,
          after: null
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyEventsConnection: {
            __typename: 'JourneyEventsConnection',
            edges: [
              {
                __typename: 'JourneyEventEdge',
                cursor: 'cursor1',
                node: {
                  __typename: 'JourneyEvent',
                  journeyId: 'journey1',
                  visitorId: 'visitor1',
                  label: 'Page 1',
                  value: 'Value 1',
                  typename: 'ButtonClickEvent',
                  progress: null,
                  journeySlug: 'test-journey',
                  visitorName: 'Test User',
                  visitorEmail: 'test@example.com',
                  visitorPhone: '1234567890'
                }
              }
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: 'cursor1',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor1'
            }
          }
        }
      }))
    }

    const mockGetJourneyEventsQueryPage2: MockedResponse<
      GetJourneyEvents,
      GetJourneyEventsVariables
    > = {
      request: {
        query: GET_JOURNEY_EVENTS_EXPORT,
        variables: {
          journeyId: 'journey1',
          filter: {
            typenames: ['ButtonClickEvent'],
            periodRangeStart: '2023-01-15T12:00:00Z',
            periodRangeEnd: '2024-01-15T12:00:00Z'
          },
          first: 20000,
          after: 'cursor1'
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyEventsConnection: {
            __typename: 'JourneyEventsConnection',
            edges: [
              {
                __typename: 'JourneyEventEdge',
                cursor: 'cursor2',
                node: {
                  __typename: 'JourneyEvent',
                  journeyId: 'journey1',
                  visitorId: 'visitor2',
                  label: 'Page 2',
                  value: 'Value 2',
                  typename: 'ButtonClickEvent',
                  progress: null,
                  journey: {
                    __typename: 'Journey',
                    slug: 'test-journey'
                  },
                  visitor: {
                    __typename: 'Visitor',
                    email: 'test2@example.com',
                    name: 'User 2'
                  }
                }
              }
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: 'cursor2',
              hasNextPage: false,
              hasPreviousPage: true,
              startCursor: 'cursor2'
            }
          }
        }
      }))
    }

    const mockCreateEventsExportLogMutation: MockedResponse<
      CreateEventsExportLog,
      CreateEventsExportLogVariables
    > = {
      request: {
        query: CREATE_EVENTS_EXPORT_LOG,
        variables: {
          input: {
            journeyId: 'journey1',
            eventsFilter: [EventType.ButtonClickEvent],
            dateRangeStart: '2023-01-15T12:00:00Z',
            dateRangeEnd: '2024-01-15T12:00:00Z'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          createJourneyEventsExportLog: {
            __typename: 'JourneyEventsExportLog',
            id: '123'
          }
        }
      }))
    }

    const { result } = renderHook(() => useJourneyEventsExport(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            mockGetJourneyEventsQueryPage1,
            mockGetJourneyEventsQueryPage2,
            mockCreateEventsExportLogMutation
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current.exportJourneyEvents({
        journeyId: 'journey1',
        filter: {
          typenames: ['ButtonClickEvent'],
          periodRangeStart: '2023-01-15T12:00:00Z',
          periodRangeEnd: '2024-01-15T12:00:00Z'
        }
      })
    })

    expect(mockGetJourneyEventsQueryPage1.result).toHaveBeenCalled()
    expect(mockGetJourneyEventsQueryPage2.result).toHaveBeenCalled()

    await waitFor(() => expect(createElementSpy).toHaveBeenCalledWith('a'))
    expect(setAttributeSpy).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}\] test-journey\.csv/)
    )
    expect(appendChildSpy).toHaveBeenCalled()
  })

  it('should throw an error when data retrieval fails', async () => {
    const { result } = renderHook(() => useJourneyEventsExport(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_JOURNEY_EVENTS_EXPORT,
                variables: {
                  journeyId: 'journey1',
                  filter: {
                    typenames: FILTERED_EVENTS
                  },
                  first: 20000,
                  after: null
                }
              },
              error: new Error('Failed to retrieve data for export.')
            },
            mockCreateEventsExportLogMutation
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await expect(
      act(async () => {
        await result.current.exportJourneyEvents({
          journeyId: 'journey1',
          filter: {}
        })
      })
    ).rejects.toThrow('Failed to retrieve data for export.')
  })
})
