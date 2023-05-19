import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { AuthUser } from 'next-firebase-auth'
import {
  defaultTemplate,
  oldTemplate
} from '../../TemplateLibrary/TemplateListData'
import { ThemeProvider } from '../../ThemeProvider'
import { SortOrder } from '../../JourneyList/JourneySort'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../../JourneyList/ArchivedJourneyList/ArchivedJourneyList'
import {
  ArchivedTemplates,
  GET_ARCHIVED_PUBLISHER_TEMPLATES
} from './ArchivedTemplates'

const archivedJourneysMock = {
  request: {
    query: GET_ARCHIVED_PUBLISHER_TEMPLATES
  },
  result: {
    data: {
      journeys: [defaultTemplate, oldTemplate]
    }
  }
}

const noJourneysMock = {
  request: {
    query: GET_ARCHIVED_PUBLISHER_TEMPLATES
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const authUser = { id: 'user-id1' } as unknown as AuthUser

describe('ArchivedTemplates', () => {
  it('should render templates in descending createdAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[archivedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedTemplates onLoad={noop} event="" />
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
              query: GET_ARCHIVED_PUBLISHER_TEMPLATES
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
            <ArchivedTemplates
              onLoad={noop}
              sortOrder={SortOrder.TITLE}
              event=""
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('template-card')[0].textContent).toContain(
        'a lower case titleJanuary 1DraftEnglish'
      )
    )
    expect(getAllByLabelText('template-card')[1].textContent).toContain(
      'An Old Template HeadingNovember 19, 2020 - Template created before the current year should also show the year in the datePublishedEnglish'
    )
  })

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedTemplates onLoad={noop} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('template-card')).toHaveLength(3)
    )
  })

  it('should call onLoad when query is loaded', async () => {
    const onLoad = jest.fn()
    render(
      <MockedProvider mocks={[noJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedTemplates onLoad={onLoad} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(onLoad).toHaveBeenCalled())
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
    const onLoad = jest.fn()

    it('should display the unarchive all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplates onLoad={noop} event="restoreAllArchived" />
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
              <ArchivedTemplates
                onLoad={onLoad}
                event="restoreAllArchived"
                authUser={authUser}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
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
                <ArchivedTemplates
                  onLoad={onLoad}
                  event="restoreAllArchived"
                  authUser={authUser}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
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
    const onLoad = jest.fn()

    it('should display the trash all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedTemplates onLoad={noop} event="trashAllArchived" />
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
              <ArchivedTemplates
                onLoad={onLoad}
                event="trashAllArchived"
                authUser={authUser}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
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
                <ArchivedTemplates
                  onLoad={onLoad}
                  event="trashAllArchived"
                  authUser={authUser}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
      fireEvent.click(getByText('Trash'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })
})
