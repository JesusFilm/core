import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../../JourneyList/ArchivedJourneyList/ArchivedJourneyList'
import { SortOrder } from '../../JourneyList/JourneySort'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultTemplate, fakeDate, oldTemplate } from '../data'

import { ArchivedTemplateList } from '.'

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

describe('ArchivedTemplateList', () => {
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
  })
})
