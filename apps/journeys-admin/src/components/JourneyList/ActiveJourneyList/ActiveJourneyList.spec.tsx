import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { AuthUser } from 'next-firebase-auth'
import { defaultJourney, oldJourney } from '../journeyListData'
import { ThemeProvider } from '../../ThemeProvider'
import { SortOrder } from '../JourneySort'
import { GET_ACTIVE_JOURNEYS } from '../../../libs/useActiveJourneys/useActiveJourneys'
import {
  ActiveJourneyList,
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from './ActiveJourneyList'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const activeJourneysMock = {
  request: {
    query: GET_ACTIVE_JOURNEYS
  },
  result: {
    data: {
      journeys: [defaultJourney, oldJourney]
    }
  }
}

const noJourneysMock = {
  request: {
    query: GET_ACTIVE_JOURNEYS
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const authUser = { id: 'user-id1' } as unknown as AuthUser

describe('ActiveJourneyList', () => {
  it('should render journeys in descending createdAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[activeJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveJourneyList onLoad={noop} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'January 1'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'November 19, 2020'
    )
  })

  it('should order journeys in alphabetical order', async () => {
    const lowerCaseJourneyTitle = {
      ...defaultJourney,
      title: 'a lower case title'
    }

    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ACTIVE_JOURNEYS
            },
            result: {
              data: {
                journeys: [lowerCaseJourneyTitle, oldJourney]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveJourneyList
              onLoad={noop}
              sortOrder={SortOrder.TITLE}
              event=""
            />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'An Old Journey Heading'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'a lower case title'
    )
  })

  it('should ask users to add a new journey', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[noJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveJourneyList onLoad={noop} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No journeys to display.')).toBeInTheDocument()
    )
    expect(
      getByText('Create a journey, then find it here.')
    ).toBeInTheDocument()
    expect(getByRole('button')).toBeInTheDocument()
  })

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveJourneyList onLoad={noop} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')).toHaveLength(3)
    )
  })

  it('should call onLoad when query is loaded', async () => {
    const onLoad = jest.fn()
    render(
      <MockedProvider mocks={[noJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveJourneyList onLoad={onLoad} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(onLoad).toHaveBeenCalled())
  })

  describe('Archive All', () => {
    it('should display the archive all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList onLoad={noop} event="archiveAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Archive Journeys')).toBeInTheDocument()
    })

    const result = jest.fn(() => ({
      data: { journeysArchive: [{ id: defaultJourney.id, status: 'archived' }] }
    }))
    const archiveJourneysMock = {
      request: {
        query: ARCHIVE_ACTIVE_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }
    const onLoad = jest.fn()

    it('should archive all journeys', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[activeJourneysMock, archiveJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList
                onLoad={onLoad}
                event="archiveAllActive"
                authUser={authUser}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
      fireEvent.click(getByText('Archive'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            activeJourneysMock,
            { ...archiveJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ActiveJourneyList
                  onLoad={onLoad}
                  event="archiveAllActive"
                  authUser={authUser}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
      fireEvent.click(getByText('Archive'))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })

  describe('Trash All', () => {
    const result = jest.fn(() => ({
      data: { journeysTrash: [{ id: defaultJourney.id, status: 'archived' }] }
    }))
    const trashJourneysMock = {
      request: {
        query: TRASH_ACTIVE_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }
    const onLoad = jest.fn()

    it('should display the trash all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList onLoad={noop} event="trashAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Trash Journeys')).toBeInTheDocument()
    })

    it('should trash all journeys', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[activeJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList
                onLoad={onLoad}
                event="trashAllActive"
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
            activeJourneysMock,
            { ...trashJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ActiveJourneyList
                  onLoad={onLoad}
                  event="trashAllActive"
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
