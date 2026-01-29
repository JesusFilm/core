import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../../JourneyList/JourneyListContent/JourneyListContent'
import { SortOrder } from '../../JourneyList/JourneySort'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultTemplate, fakeDate, oldTemplate } from '../data'

import { ArchivedTemplateList } from '.'

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

const archivedJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
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

const noJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
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

describe('ArchivedTemplateList', () => {
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
      <MockedProvider mocks={[archivedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedTemplateList />
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
                status: [JourneyStatus.archived],
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
            <ArchivedTemplateList sortOrder={SortOrder.TITLE} />
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

  it('should display no archived templates message', async () => {
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.archived],
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
            <ArchivedTemplateList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No archived templates.')).toBeInTheDocument()
    )
  })

  describe('Unarchive All', () => {
    const result = jest.fn(() => ({
      data: {
        journeysRestore: [
          {
            id: defaultTemplate.id,
            __typename: 'Journey',
            status: JourneyStatus.published,
            fromTemplateId: 'template-1'
          },
          {
            id: oldTemplate.id,
            __typename: 'Journey',
            status: JourneyStatus.published,
            fromTemplateId: 'template-2'
          }
        ]
      }
    }))
    const archiveJourneysMock = {
      request: {
        query: RESTORE_ARCHIVED_JOURNEYS,
        variables: { ids: [defaultTemplate.id, oldTemplate.id] }
      },
      result
    }

    it('should display the unarchive all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplateList event="restoreAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Unarchive Templates')).toBeInTheDocument()
      )
    })

    it('should unarchive all templates', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[archivedJourneysMock, archiveJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplateList event="restoreAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Unarchive'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            archivedJourneysMock,
            { ...archiveJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ArchivedTemplateList event="restoreAllArchived" />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Unarchive'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })

    it('should show "No templates have been restored" when no templates to restore', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider mocks={[noJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplateList event="restoreAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Unarchive Templates')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Unarchive' }))

      await waitFor(() =>
        expect(getByText('No templates have been restored')).toBeInTheDocument()
      )
    })

    it('should call refetchTemplateStats when restoring templates with fromTemplateId', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[archivedJourneysMock, archiveJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplateList event="restoreAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Unarchive'))
      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() => {
        expect(refetchTemplateStats).toHaveBeenCalledWith([
          'template-1',
          'template-2'
        ])
      })
    })
  })

  describe('Trash All', () => {
    const result = jest.fn(() => ({
      data: {
        journeysTrash: [
          {
            id: defaultTemplate.id,
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: 'template-1'
          },
          {
            id: oldTemplate.id,
            __typename: 'Journey',
            status: JourneyStatus.trashed,
            fromTemplateId: 'template-2'
          }
        ]
      }
    }))
    const trashJourneysMock = {
      request: {
        query: TRASH_ARCHIVED_JOURNEYS,
        variables: {
          ids: [defaultTemplate.id, oldTemplate.id]
        }
      },
      result
    }

    it('should display the trash all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplateList event="trashAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      expect(getByText('Trash Templates')).toBeInTheDocument()
    })

    it('should trash all templates', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[archivedJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplateList event="trashAllArchived" />
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
            archivedJourneysMock,
            { ...trashJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ArchivedTemplateList event="trashAllArchived" />
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
        <MockedProvider mocks={[noJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplateList event="trashAllArchived" />
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
          mocks={[archivedJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplateList event="trashAllArchived" />
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
