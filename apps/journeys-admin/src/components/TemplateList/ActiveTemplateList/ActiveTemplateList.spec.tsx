import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import {
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from '../../JourneyList/JourneyListContent/JourneyListContent'
import { SortOrder } from '../../JourneyList/JourneySort'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultTemplate, fakeDate, oldTemplate } from '../data'

import { ActiveTemplateList } from '.'

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

const ActiveTemplateListMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: true,
      teamId: 'jfp-team'
    }
  },
  result: {
    data: {
      journeys: [defaultTemplate, oldTemplate]
    }
  }
}

const noTemplatesMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
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

describe('ActiveTemplateList', () => {
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
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[ActiveTemplateListMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveTemplateList />
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
    const lowerCaseJourneyTitle = {
      ...defaultTemplate,
      title: 'a lower case title'
    }

    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.draft, JourneyStatus.published],
                template: true,
                teamId: 'jfp-team'
              }
            },
            result: {
              data: {
                journeys: [lowerCaseJourneyTitle, oldTemplate]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveTemplateList sortOrder={SortOrder.TITLE} />
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

  it('should display no templates message', async () => {
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.draft, JourneyStatus.published],
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
            <ActiveTemplateList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No templates to display.')).toBeInTheDocument()
    )
  })

  describe('Archive All', () => {
    const result = jest.fn(() => ({
      data: {
        journeysArchive: [{ id: defaultTemplate.id, status: 'archived' }]
      }
    }))
    const archiveJourneysMock = {
      request: {
        query: ARCHIVE_ACTIVE_JOURNEYS,
        variables: {
          ids: [defaultTemplate.id, oldTemplate.id]
        }
      },
      result
    }

    it('should display the archive all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[ActiveTemplateListMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplateList event="archiveAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Archive Templates')).toBeInTheDocument()
      )
    })

    it('should archive all journeys', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider mocks={[ActiveTemplateListMock, archiveJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplateList event="archiveAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Archive' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            ActiveTemplateListMock,
            { ...archiveJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ActiveTemplateList event="archiveAllActive" />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Archive' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })

    it('should show "No templates have been archived" when no templates to archive', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider mocks={[noTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplateList event="archiveAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Archive Templates')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Archive' }))

      await waitFor(() =>
        expect(getByText('No templates have been archived')).toBeInTheDocument()
      )
    })
  })

  describe('Trash All', () => {
    const result = jest.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: defaultTemplate.id,
            status: 'archived',
            fromTemplateId: 'template-1'
          },
          {
            id: oldTemplate.id,
            status: 'archived',
            fromTemplateId: 'template-2'
          }
        ]
      }
    }))
    const trashTemplatesMock = {
      request: {
        query: TRASH_ACTIVE_JOURNEYS,
        variables: {
          ids: [defaultTemplate.id, oldTemplate.id]
        }
      },
      result
    }

    it('should display the trash all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[ActiveTemplateListMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplateList event="trashAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Trash Templates')).toBeInTheDocument()
    })

    it('should trash all journeys', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[ActiveTemplateListMock, trashTemplatesMock, noTemplatesMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplateList event="trashAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Trash' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            ActiveTemplateListMock,
            { ...trashTemplatesMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ActiveTemplateList event="trashAllActive" />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Trash' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })

    it('should show "No templates have been trashed" when no templates to trash', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider mocks={[noTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplateList event="trashAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Trash Templates')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Trash' }))

      await waitFor(() =>
        expect(getByText('No templates have been trashed')).toBeInTheDocument()
      )
    })

    it('should call refetchTemplateStats when trashing templates with fromTemplateId', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[ActiveTemplateListMock, trashTemplatesMock, noTemplatesMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplateList event="trashAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Trash' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() => {
        expect(refetchTemplateStats).toHaveBeenCalledWith([
          'template-1',
          'template-2'
        ])
      })
    })
  })
})
