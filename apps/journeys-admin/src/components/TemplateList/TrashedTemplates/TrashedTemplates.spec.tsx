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
  RESTORE_TRASHED_JOURNEYS,
  DELETE_TRASHED_JOURNEYS
} from '../../JourneyList/TrashedJourneyList/TrashedJourneyList'
import {
  TrashedTemplates,
  GET_TRASHED_PUBLISHER_TEMPLATES
} from './TrashedTemplates'

const trashedJourneysMock = {
  request: {
    query: GET_TRASHED_PUBLISHER_TEMPLATES
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
    query: GET_TRASHED_PUBLISHER_TEMPLATES
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const authUser = { id: 'user-id1' } as unknown as AuthUser

describe('TrashedTemplatesTab', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-12-11'))
  })

  it('should render templates in descending createdAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[trashedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedTemplates onLoad={noop} event="" />
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
              query: GET_TRASHED_PUBLISHER_TEMPLATES
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
            <TrashedTemplates
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
        'An Old Template Heading'
      )
    )
    expect(getAllByLabelText('template-card')[1].textContent).toContain(
      'a lower case title'
    )
  })

  it('should exclude templates older than 40 days', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TRASHED_PUBLISHER_TEMPLATES
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
            <TrashedTemplates
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
        'Default Template Heading'
      )
    )
    expect(getAllByLabelText('template-card')[1]).toBeUndefined()
  })

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedTemplates onLoad={noop} event="" />
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
            <TrashedTemplates onLoad={onLoad} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(onLoad).toHaveBeenCalled())
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
    const onLoad = jest.fn()

    it('should display the restore all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplates onLoad={noop} event="restoreAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Restore Templates')).toBeInTheDocument()
    })

    it('should restore all journeys', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[trashedJourneysMock, restoreJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplates
                onLoad={onLoad}
                event="restoreAllTrashed"
                authUser={authUser}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
      fireEvent.click(getByText('Restore'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    // test intermittently fails due to snackbar and dom timeout
    xit('should show error', async () => {
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
                <TrashedTemplates
                  onLoad={onLoad}
                  event="restoreAllTrashed"
                  authUser={authUser}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
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
    const onLoad = jest.fn()

    it('should display the delete all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedTemplates onLoad={noop} event="deleteAllTrashed" />
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
              <TrashedTemplates
                onLoad={onLoad}
                event="deleteAllTrashed"
                authUser={authUser}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
      fireEvent.click(getByText('Delete Forever'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    // test intermittently fails due to snackbar and dom timeout
    xit('should show error', async () => {
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
                <TrashedTemplates
                  onLoad={onLoad}
                  event="deleteAllTrashed"
                  authUser={authUser}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
      fireEvent.click(getByText('Delete Forever'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument(), {
        timeout: 1500
      })
    })
  })
})
