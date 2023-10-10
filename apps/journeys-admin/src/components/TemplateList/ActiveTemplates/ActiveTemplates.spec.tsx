import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useJourneysAdminQuery/useJourneysAdminQuery'
import {
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from '../../JourneyList/ActiveJourneyList/ActiveJourneyList'
import { SortOrder } from '../../JourneyList/JourneySort'
import {
  defaultTemplate,
  oldTemplate
} from '../../TemplateLibrary/TemplateListData'
import { ThemeProvider } from '../../ThemeProvider'

import { ActiveTemplates } from '.'

const activeTemplatesMock = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: true
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
      template: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('ActiveTemplates', () => {
  it('should render templates in descending createdAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[activeTemplatesMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveTemplates />
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
                status: [JourneyStatus.draft, JourneyStatus.published],
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
            <ActiveTemplates sortOrder={SortOrder.TITLE} />
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

  it('should display no templates message', async () => {
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.draft, JourneyStatus.published],
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
            <ActiveTemplates sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No templates to display.')).toBeInTheDocument()
    )
  })

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveTemplates />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('template-card')).toHaveLength(3)
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

    it('should display the archive all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplates event="archiveAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Archive Templates')).toBeInTheDocument()
    })

    it('should archive all journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeTemplatesMock, archiveJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplates event="archiveAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Archive'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            activeTemplatesMock,
            { ...archiveJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ActiveTemplates event="archiveAllActive" />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Template Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByText('Archive'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })

  describe('Trash All', () => {
    const result = jest.fn(() => ({
      data: {
        journeysTrash: [{ id: defaultTemplate.id, status: 'archived' }]
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
        <MockedProvider mocks={[activeTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplates event="trashAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Trash Templates')).toBeInTheDocument()
    })

    it('should trash all journeys', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[activeTemplatesMock, trashTemplatesMock, noTemplatesMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveTemplates event="trashAllActive" />
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
            activeTemplatesMock,
            { ...trashTemplatesMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ActiveTemplates event="trashAllActive" />
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
