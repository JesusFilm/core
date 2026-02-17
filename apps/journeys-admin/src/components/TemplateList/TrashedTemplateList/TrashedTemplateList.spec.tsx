import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import {
  DELETE_TRASHED_JOURNEYS,
  RESTORE_TRASHED_JOURNEYS
} from '../../JourneyList/JourneyListContent/JourneyListContent'
import { SortOrder } from '../../JourneyList/JourneySort'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultTemplate, fakeDate, oldTemplate } from '../data'

import { TrashedTemplateList } from '.'

jest.mock('../../../libs/useTemplateFamilyStatsAggregateLazyQuery', () => ({
  useTemplateFamilyStatsAggregateLazyQuery: jest.fn(),
  extractTemplateIdsFromJourneys: jest.requireActual(
    '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
  ).extractTemplateIdsFromJourneys
}))

const mockedUseTemplateFamilyStatsAggregateLazyQuery =
  useTemplateFamilyStatsAggregateLazyQuery as jest.MockedFunction<
    typeof useTemplateFamilyStatsAggregateLazyQuery
  >

const trashedJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true,
      teamId: 'jfp-team'
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
      template: true,
      teamId: 'jfp-team'
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('TrashedTemplateList', () => {
  const refetchTemplateStats = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    refetchTemplateStats.mockClear()
    mockedUseTemplateFamilyStatsAggregateLazyQuery.mockReturnValue({
      query: [
        jest.fn(),
        {
          data: undefined,
          loading: false,
          error: undefined
        }
      ] as any,
      refetchTemplateStats
    })
  })

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should render templates in descending updatedAt date by default', async () => {
    render(
      <MockedProvider mocks={[trashedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedTemplateList />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByLabelText('journey-card')[0].textContent).toContain(
        '11 months ago'
      )
    )
    expect(screen.getAllByLabelText('journey-card')[1].textContent).toContain(
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
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                template: true,
                teamId: 'jfp-team'
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
      expect(screen.getAllByLabelText('journey-card')[0].textContent).toContain(
        'a lower case title'
      )
    )
    expect(screen.getAllByLabelText('journey-card')[1].textContent).toContain(
      'An Old Template'
    )
  })

  it('should exclude templates older than 40 days', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                template: true,
                teamId: 'jfp-team'
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
      expect(screen.getAllByLabelText('journey-card')[0].textContent).toContain(
        'Default Template Heading'
      )
    )
    expect(screen.getAllByLabelText('journey-card')[1]).toBeUndefined()
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
                template: true,
                teamId: 'jfp-team'
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
      data: {
        journeysRestore: [
          {
            id: defaultTemplate.id,
            status: 'published',
            fromTemplateId: 'template-1'
          },
          {
            id: oldTemplate.id,
            status: 'published',
            fromTemplateId: 'template-2'
          }
        ]
      }
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
      render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplateList event="restoreAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Restore Templates')).toBeInTheDocument()
      )
    })

    it('should restore all journeys', async () => {
      render(
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
        expect(screen.getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByText('Restore'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      render(
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
        expect(screen.getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByText('Restore'))
      await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument())
    })

    it('should show "No templates have been restored" when no templates to restore', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider mocks={[noJourneysMock]}>
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

      fireEvent.click(getByRole('button', { name: 'Restore' }))

      await waitFor(() =>
        expect(getByText('No templates have been restored')).toBeInTheDocument()
      )
    })

    it('should call refetchTemplateStats when restoring templates with fromTemplateId', async () => {
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
      await waitFor(() => {
        expect(refetchTemplateStats).toHaveBeenCalledWith([
          'template-1',
          'template-2'
        ])
      })
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

    it('should show "No templates have been deleted" when no templates to delete', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider mocks={[noJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplateList event="deleteAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Delete Templates Forever')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Delete Forever' }))

      await waitFor(() =>
        expect(getByText('No templates have been deleted')).toBeInTheDocument()
      )
    })
  })
})
