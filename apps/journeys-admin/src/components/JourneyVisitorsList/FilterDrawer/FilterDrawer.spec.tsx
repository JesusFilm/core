import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import {
  CreateEventsExportLog,
  CreateEventsExportLogVariables
} from '../../../../__generated__/CreateEventsExportLog'
import {
  GetJourneyEvents,
  GetJourneyEventsVariables
} from '../../../../__generated__/GetJourneyEvents'
import { ButtonAction } from '../../../../__generated__/globalTypes'
import {
  FILTERED_EVENTS,
  GET_JOURNEY_EVENTS_EXPORT
} from '../../../libs/useJourneyEventsExport/useJourneyEventsExport'
import { mockCreateEventsExportLogMutation } from '../../../libs/useJourneyEventsExport/useJourneyEventsExport.mock'

import { FilterDrawer } from './FilterDrawer'

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
          },
          {
            __typename: 'JourneyEventEdge',
            cursor: 'cursor2',
            node: {
              __typename: 'JourneyEvent',
              journeyId: '123',
              label: 'Test',
              value: 'Test',
              messagePlatform: null,
              progress: null,
              typename: 'StepViewEvent',
              visitorId: 'visitor.id',
              visitor: {
                __typename: 'Visitor',
                email: 'test@example.com',
                name: 'Test User'
              },
              journey: {
                __typename: 'Journey',
                slug: 'test-journey'
              }
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
  }))
}

const props = {
  journeyId: 'journey1',
  chatStarted: false,
  withPollAnswers: false,
  withSubmittedText: false,
  withIcon: false,
  hideInteractive: false,
  handleClearAll: jest.fn(),
  handleChange: jest.fn((e) => e.target.value)
}

describe('FilterDrawer', () => {
  it('calls handleClearAll when the clear all button is clicked', async () => {
    render(
      <MockedProvider>
        <FilterDrawer {...props} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Clear all'))
    expect(props.handleClearAll).toHaveBeenCalled()
  })

  it('calls handleChange when checkboxes and radio buttons are selected', async () => {
    const { handleChange } = props
    render(
      <MockedProvider>
        <FilterDrawer {...props} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Chat Started'))
    expect(handleChange).toHaveReturnedWith('Chat Started')
    fireEvent.click(screen.getByText('With Poll Answers'))
    expect(handleChange).toHaveReturnedWith('With Poll Answers')
    fireEvent.click(screen.getByText('With Submitted Text'))
    expect(handleChange).toHaveReturnedWith('With Submitted Text')
    fireEvent.click(screen.getByText('With Icon'))
    expect(handleChange).toHaveReturnedWith('With Icon')
    fireEvent.click(screen.getByText('Hide Inactive'))
    expect(handleChange).toHaveReturnedWith('Hide Inactive')
    fireEvent.click(screen.getByText('Duration'))
    expect(handleChange).toHaveReturnedWith('duration')
    expect(screen.getByRole('radio', { name: 'Date' })).not.toBeChecked()
    fireEvent.click(screen.getByText('Date'))
    expect(handleChange).toHaveReturnedWith('date')
    expect(screen.getByRole('radio', { name: 'Duration' })).not.toBeChecked()
  })

  describe('export', () => {
    const originalCreateElement = document.createElement
    const originalAppendChild = document.body.appendChild

    beforeEach(() => {
      jest.clearAllMocks()

      document.createElement = originalCreateElement
      document.body.appendChild = originalAppendChild
    })

    it('renders the export button', async () => {
      render(
        <MockedProvider>
          <FilterDrawer {...props} />
        </MockedProvider>
      )

      expect(
        screen.getByRole('button', { name: 'Export Data' })
      ).toBeInTheDocument()
    })

    it('should not render the export button if journeyId is not provided', async () => {
      const { journeyId, ...rest } = props

      render(
        <MockedProvider>
          <FilterDrawer {...rest} />
        </MockedProvider>
      )

      expect(
        screen.queryByRole('button', { name: 'Export Data' })
      ).not.toBeInTheDocument()
    })

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
          <FilterDrawer {...props} />
        </MockedProvider>
      )

      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: 'Export Data' }))

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
          <FilterDrawer {...props} />
        </MockedProvider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Export Data' }))

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
            <FilterDrawer {...props} />
          </MockedProvider>
        </SnackbarProvider>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Export Data' }))

      expect(getJourneyEventsErrorMock.result).toHaveBeenCalled()
      expect(
        screen.getByText('Failed to retrieve data for export.')
      ).toBeInTheDocument()
      expect(mutationResult).not.toHaveBeenCalled()
    })
  })
})
