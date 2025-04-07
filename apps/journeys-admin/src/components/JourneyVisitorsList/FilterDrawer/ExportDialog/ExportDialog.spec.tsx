import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import {
  GetJourneyEvents,
  GetJourneyEventsVariables
} from '../../../../../__generated__/GetJourneyEvents'
import {
  FILTERED_EVENTS,
  GET_JOURNEY_EVENTS_EXPORT
} from '../../../../libs/useJourneyEventsExport/useJourneyEventsExport'
import { mockCreateEventsExportLogMutation } from '../../../../libs/useJourneyEventsExport/useJourneyEventsExport.mock'

import { ExportDialog } from './ExportDialog'

const getJourneyEventsMock: MockedResponse<
  GetJourneyEvents,
  GetJourneyEventsVariables
> = {
  request: {
    query: GET_JOURNEY_EVENTS_EXPORT,
    variables: {
      journeyId: 'journey1',
      filter: {
        typenames: FILTERED_EVENTS
      },
      after: null,
      first: 20000
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
              journeyId: '123',
              visitorId: 'visitor.id',
              label: 'Test',
              value: 'Test',
              typename: 'StepViewEvent',
              progress: null,
              messagePlatform: null,
              journey: {
                __typename: 'Journey',
                slug: 'test-journey'
              },
              visitor: {
                __typename: 'Visitor',
                email: 'test@example.com',
                name: 'Test User'
              }
            }
          }
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor1',
          __typename: 'PageInfo'
        }
      }
    }
  }))
}

const props = {
  open: true,
  onClose: jest.fn(),
  journeyId: 'journey1'
}

describe('ExportDialog', () => {
  it('should fetch data when export button is clicked', async () => {
    const mutationResult = jest.fn(() => ({
      ...mockCreateEventsExportLogMutation.result
    }))

    render(
      <MockedProvider
        mocks={[
          getJourneyEventsMock,
          { ...mockCreateEventsExportLogMutation, result: mutationResult }
        ]}
      >
        <ExportDialog {...props} />
      </MockedProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Export (CSV)' }))

    await waitFor(() => {
      expect(getJourneyEventsMock.result).toHaveBeenCalled()
    })
    expect(mutationResult).toHaveBeenCalled()
  })

  it('should download the csv file', async () => {
    const createElementSpy = jest.spyOn(document, 'createElement')
    const appendChildSpy = jest.spyOn(document.body, 'appendChild')
    const setAttributeSpy = jest.spyOn(
      HTMLAnchorElement.prototype,
      'setAttribute'
    )

    render(
      <MockedProvider
        mocks={[getJourneyEventsMock, mockCreateEventsExportLogMutation]}
      >
        <ExportDialog {...props} />
      </MockedProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Export (CSV)' }))

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(setAttributeSpy).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}\] test-journey\.csv/)
    )
    expect(appendChildSpy).toHaveBeenCalled()
  })

  it('should show an error if no data is found', async () => {
    const mutationResult = jest.fn(() => ({
      ...mockCreateEventsExportLogMutation.result
    }))
    const getJourneyEventsErrorMock = {
      ...getJourneyEventsMock,
      result: jest.fn(() => ({
        errors: [
          new GraphQLError('Unexpected error', {
            extensions: { code: 'DOWNSTREAM_SERVICE_ERROR' }
          })
        ]
      }))
    }

    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            getJourneyEventsErrorMock,
            { ...mockCreateEventsExportLogMutation, result: mutationResult }
          ]}
        >
          <ExportDialog {...props} />
        </MockedProvider>
      </SnackbarProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Export (CSV)' }))

    expect(getJourneyEventsErrorMock.result).toHaveBeenCalled()
    expect(
      screen.getByText('Failed to retrieve data for export.')
    ).toBeInTheDocument()
    expect(mutationResult).not.toHaveBeenCalled()
  })
})
