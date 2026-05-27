import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { User } from '../../../libs/auth/authContext'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { ThemeProvider } from '../../ThemeProvider'
import {
  DELETE_TRASHED_JOURNEYS,
  RESTORE_TRASHED_JOURNEYS
} from '../JourneyListContent/JourneyListContent'
import { defaultJourney, fakeDate, oldJourney } from '../journeyListData'
import { SortOrder } from '../JourneySort'

import { TrashedJourneyList } from '.'

vi.mock('@core/journeys/ui/useNavigationState', async () => ({
  useNavigationState: vi.fn(() => false)
}))

vi.mock('../../../libs/useTemplateFamilyStatsAggregateLazyQuery', async () => ({
  useTemplateFamilyStatsAggregateLazyQuery: vi.fn(),
  extractTemplateIdsFromJourneys: (await vi.importActual('../../../libs/useTemplateFamilyStatsAggregateLazyQuery')).extractTemplateIdsFromJourneys
}))

const mockedUseTemplateFamilyStatsAggregateLazyQuery =
  useTemplateFamilyStatsAggregateLazyQuery as MockedFunction<
    typeof useTemplateFamilyStatsAggregateLazyQuery
  >

vi.mock('next/router', async () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({ query: { tab: 'active' } }))
}))

const trashedJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          trashedAt: '2021-12-07T03:22:41.135Z',
          status: JourneyStatus.trashed
        },
        {
          ...oldJourney,
          trashedAt: '2021-12-07T03:22:41.135Z',
          status: JourneyStatus.trashed
        }
      ]
    }
  }
}

const noJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('TrashedJourneyList', () => {
  const refetchTemplateStats = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    refetchTemplateStats.mockClear()
    mockedUseTemplateFamilyStatsAggregateLazyQuery.mockReturnValue({
      query: [
        vi.fn(),
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
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('should render journeys in descending updatedAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[trashedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedJourneyList />
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

  it('should order journeys in alphabetical order', async () => {
    const trashedLowerCaseJourneyTitle = {
      ...defaultJourney,
      title: 'a lower case title',
      trashedAt: '2021-12-07T03:22:41.135Z',
      status: JourneyStatus.trashed
    }
    const trashedOldJourney = {
      ...oldJourney,
      trashedAt: '2021-12-07T03:22:41.135Z',
      status: JourneyStatus.trashed
    }
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                useLastActiveTeamId: true
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
            <TrashedJourneyList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'a lower case titleEnglish•11 months ago00'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'An Old Journey HeadingEnglish•1 year ago00'
    )
  })

  it('should exclude journeys older than 40 days', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.trashed],
                useLastActiveTeamId: true
              }
            },
            result: {
              data: {
                journeys: [
                  { ...defaultJourney, trashedAt: '2021-12-07T03:22:41.135Z' },
                  { ...oldJourney, trashedAt: '2021-10-31T03:22:41.135Z' }
                ]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TrashedJourneyList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'Default Journey Heading'
      )
    )
    expect(getAllByLabelText('journey-card')[1]).toBeUndefined()
  })

  describe('Restore All', () => {
    const result = vi.fn(() => ({
      data: {
        journeysRestore: [
          {
            id: defaultJourney.id,
            status: 'published',
            fromTemplateId: 'template-1'
          },
          {
            id: oldJourney.id,
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
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }

    it('should display the restore all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList event="restoreAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Restore Journeys')).toBeInTheDocument()
      )
    })

    it('should restore all journeys', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[trashedJourneysMock, restoreJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList
                event="restoreAllTrashed"
                user={
                  {
                    id: 'user-id1',
                    email: null,
                    displayName: null,
                    photoURL: null,
                    phoneNumber: null,
                    emailVerified: false,
                    token: 'mock-token'
                  } as unknown as User
                }
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Restore' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            { ...restoreJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <TrashedJourneyList
                  event="restoreAllTrashed"
                  user={
                    {
                      id: 'user-id1',
                      email: null,
                      displayName: null,
                      photoURL: null,
                      phoneNumber: null,
                      emailVerified: false,
                      token: 'mock-token'
                    } as unknown as User
                  }
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Restore' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })

    it('should call refetchTemplateStats when restoring journeys with fromTemplateId', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[trashedJourneysMock, restoreJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList
                event="restoreAllTrashed"
                user={
                  {
                    id: 'user-id1',
                    email: null,
                    displayName: null,
                    photoURL: null,
                    phoneNumber: null,
                    emailVerified: false,
                    token: 'mock-token'
                  } as unknown as User
                }
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Restore' }))
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
    const result = vi.fn(() => ({
      data: [{ id: defaultJourney.id, status: 'deleted' }]
    }))
    const deleteJourneysMock = {
      request: {
        query: DELETE_TRASHED_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }

    it('should display the delete all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList event="deleteAllTrashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Delete Journeys Forever')).toBeInTheDocument()
      )
    })

    it('should trash all journeys', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[trashedJourneysMock, deleteJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TrashedJourneyList
                event="deleteAllTrashed"
                user={
                  {
                    id: 'user-id1',
                    email: null,
                    displayName: null,
                    photoURL: null,
                    phoneNumber: null,
                    emailVerified: false,
                    token: 'mock-token'
                  } as unknown as User
                }
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Delete Forever' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            trashedJourneysMock,
            { ...deleteJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <TrashedJourneyList
                  event="deleteAllTrashed"
                  user={
                    {
                      id: 'user-id1',
                      email: null,
                      displayName: null,
                      photoURL: null,
                      phoneNumber: null,
                      emailVerified: false,
                      token: 'mock-token'
                    } as unknown as User
                  }
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Delete Forever' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })
})
