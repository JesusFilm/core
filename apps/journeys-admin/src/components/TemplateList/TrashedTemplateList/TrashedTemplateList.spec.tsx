import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { SortOrder } from '../../JourneyList/JourneySort'
import {
  DELETE_TRASHED_JOURNEYS,
  RESTORE_TRASHED_JOURNEYS
} from '../../JourneyList/TrashedJourneyList/TrashedJourneyList'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultTemplate, fakeDate, oldTemplate } from '../data'

import { TrashedTemplateList } from '.'

const trashedJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true
    }
  },
  result: {
    data: {
      journeys: [
        { ...defaultTemplate, trashedAt: '2021-12-07T03:22:41.135Z' },
        { ...oldTemplate, trashedAt: '2021-12-07T03:22:41.135Z' }
      ]
    }
  }
}

const noJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('TrashedTemplateList', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should render templates in descending updatedAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[trashedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedTemplateList />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        '11 months ago'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      '1 year ago'
    )
  })

  it('should order templates in alphabetical order', async () => {
    const trashedLowerCaseJourneyTitle = {
      ...defaultTemplate,
      title: 'a lower case title',
      trashedAt: '2021-12-07T03:22:41.135Z'
    }
    const trashedOldJourney = {
      ...oldTemplate,
      trashedAt: '2021-12-07T03:22:41.135Z'
    }
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                template: true
              }
            },
            result: {
              data: {
                journeys: [trashedLowerCaseJourneyTitle, trashedOldJourney]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedTemplateList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'a lower case title'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'An Old Template'
    )
  })

  it('should exclude templates older than 40 days', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                template: true
              }
            },
            result: {
              data: {
                journeys: [
                  { ...defaultTemplate, trashedAt: '2021-12-07T03:22:41.135Z' },
                  { ...oldTemplate, trashedAt: '2021-10-31T03:22:41.135Z' }
                ]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedTemplateList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'Default Template Heading'
      )
    )
    expect(getAllByLabelText('journey-card')[1]).toBeUndefined()
  })

  it('should display no trashed templates message', async () => {
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                template: true
              }
            },
            result: {
              data: {
                journeys: []
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedTemplateList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByText('Your trashed templates will appear here.')
      ).toBeInTheDocument()
    )
  })

  describe('Restore All', () => {
    const result = jest.fn(() => ({
      data: [{ id: defaultTemplate.id, status: 'published' }]
    }))
    const restoreJourneysMock = {
      request: {
        query: RESTORE_TRASHED_JOURNEYS,
        variables: {
          ids: [defaultTemplate.id, oldTemplate.id]
        }
      },
      result
    }

    it('should display the restore all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplateList event="restoreAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Restore Templates')).toBeInTheDocument()
      )
    })

    it('should restore all journeys', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[trashedJourneysMock, restoreJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplateList event="restoreAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Restore'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            { ...restoreJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <TrashedTemplateList event="restoreAllTrashed" />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Restore'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })

  describe('Delete All', () => {
    const result = jest.fn(() => ({
      data: { journeysDelete: [{ id: defaultTemplate.id, status: 'deleted' }] }
    }))
    const deleteJourneysMock = {
      request: {
        query: DELETE_TRASHED_JOURNEYS,
        variables: {
          ids: [defaultTemplate.id, oldTemplate.id]
        }
      },
      result
    }

    it('should display the delete all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplateList event="deleteAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      expect(getByText('Delete Templates Forever')).toBeInTheDocument()
    })

    it('should trash all templates', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[trashedJourneysMock, deleteJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplateList event="deleteAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Delete Forever'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            { ...deleteJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <TrashedTemplateList event="deleteAllTrashed" />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Delete Forever'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })
})
