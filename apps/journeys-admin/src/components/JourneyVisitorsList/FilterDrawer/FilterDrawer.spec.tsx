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
  CREATE_EVENTS_EXPORT_LOG,
  FilterDrawer,
  GET_JOURNEY_EVENTS_EXPORT
} from './FilterDrawer'

const getJourneyEventsMock: MockedResponse<
  GetJourneyEvents,
  GetJourneyEventsVariables
> = {
  request: {
    query: GET_JOURNEY_EVENTS_EXPORT,
    variables: {
      journeyId: '123',
      after: null,
      first: 50
    }
  },
  result: jest.fn(() => ({
    data: {
      journeyEventsConnection: {
        __typename: 'JourneyEventsConnection',
        edges: [
          {
            __typename: 'JourneyEventEdge',
            node: {
              __typename: 'JourneyEvent',
              id: '123',
              journeyId: '123',
              createdAt: '2021-01-01',
              label: 'Test',
              value: 'Test',
              action: null,
              actionValue: null,
              messagePlatform: null,
              language: null,
              email: null,
              blockId: null,
              position: null,
              source: null,
              progress: null,
              typename: 'StepViewEvent',
              visitorId: 'visitor.id',
              visitor: null,
              journey: {
                __typename: 'Journey',
                id: '123',
                title: 'Test Journey',
                slug: 'test-journey'
              }
            }
          },
          {
            __typename: 'JourneyEventEdge',
            node: {
              __typename: 'JourneyEvent',
              id: '123',
              journeyId: '123',
              createdAt: '2021-01-01',
              label: 'Test',
              value: 'Test',
              action: ButtonAction.NavigateToBlockAction,
              actionValue: 'nextBlock',
              messagePlatform: null,
              language: null,
              email: null,
              blockId: null,
              position: null,
              source: null,
              progress: null,
              typename: 'StepViewEvent',
              visitorId: 'visitor.id',
              visitor: null,
              journey: {
                __typename: 'Journey',
                id: '123',
                title: 'Test Journey',
                slug: 'test-journey'
              }
            }
          }
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'ace21868-f605-4b2c-8a4d-c8c8b5947b49',
          endCursor: 'de0c1bf8-d43b-40a9-b7d3-9368cc870263',
          __typename: 'PageInfo'
        }
      }
    }
  }))
}

const createEventsExportLogMock: MockedResponse<
  CreateEventsExportLog,
  CreateEventsExportLogVariables
> = {
  request: {
    query: CREATE_EVENTS_EXPORT_LOG,
    variables: {
      input: {
        journeyId: '123',
        eventsFilter: []
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
const props = {
  journeyId: '123',
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
      render(
        <MockedProvider
          mocks={[getJourneyEventsMock, createEventsExportLogMock]}
        >
          <FilterDrawer {...props} />
        </MockedProvider>
      )

      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: 'Export Data' }))

      await waitFor(() => {
        expect(getJourneyEventsMock.result).toHaveBeenCalled()
      })
      expect(createEventsExportLogMock.result).toHaveBeenCalled()
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
          mocks={[getJourneyEventsMock, createEventsExportLogMock]}
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
            mocks={[getJourneyEventsErrorMock, createEventsExportLogMock]}
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
      expect(createEventsExportLogMock.result).not.toHaveBeenCalled()
    })
  })
})
