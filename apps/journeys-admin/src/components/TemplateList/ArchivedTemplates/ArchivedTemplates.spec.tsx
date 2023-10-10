import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useJourneysAdminQuery/useJourneysAdminQuery'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../../JourneyList/ArchivedJourneyList/ArchivedJourneyList'
import { SortOrder } from '../../JourneyList/JourneySort'
import {
  defaultTemplate,
  oldTemplate
} from '../../TemplateLibrary/TemplateListData'
import { ThemeProvider } from '../../ThemeProvider'

import { ArchivedTemplates } from '.'

const archivedJourneysMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: true
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
      template: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('ArchivedTemplates', () => {
  it('should render templates in descending createdAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[archivedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedTemplates />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('template-card')[0].textContent).toContain(
        'January 1'
      )
    )
    expect(getAllByLabelText('template-card')[1].textContent).toContain(
      'November 19, 2020'
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
                template: true
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
            <ArchivedTemplates sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('template-card')[0].textContent).toContain(
        'a lower case titleJanuary 1English'
      )
    )
    expect(getAllByLabelText('template-card')[1].textContent).toContain(
      'An Old Template HeadingNovember 19, 2020 - Template created before the current year should also show the year in the dateEnglish'
    )
  })

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedTemplates />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('template-card')).toHaveLength(3)
    )
  })

  describe('Unarchive All', () => {
    const result = jest.fn(() => ({
      data: {
        journeysRestore: [{ id: defaultTemplate.id, status: 'published' }]
      }
    }))
    const archiveJourneysMock = {
      request: {
        query: RESTORE_ARCHIVED_JOURNEYS,
        variables: { ids: [defaultTemplate.id, oldTemplate.id] }
      },
      result
    }

    it('should display the unarchive all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplates event="restoreAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      expect(getByText('Unarchive Templates')).toBeInTheDocument()
    })

    it('should unarchive all templates', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[archivedJourneysMock, archiveJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplates event="restoreAllArchived" />
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
                <ArchivedTemplates event="restoreAllArchived" />
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
  })

  describe('Trash All', () => {
    const result = jest.fn(() => ({
      data: {
        journeysTrash: [{ id: defaultTemplate.id, status: 'trashAllArchived' }]
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
              <ArchivedTemplates event="trashAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      expect(getByText('Trash Templates')).toBeInTheDocument()
    })

    it('should trash all templates', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[archivedJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplates event="trashAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Trash'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            archivedJourneysMock,
            { ...trashJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ArchivedTemplates event="trashAllArchived" />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Trash'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })
})
