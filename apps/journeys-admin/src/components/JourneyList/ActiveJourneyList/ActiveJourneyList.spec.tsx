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
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from '../JourneyListContent/JourneyListContent'
import { defaultJourney, oldJourney } from '../journeyListData'

import { ActiveJourneyList } from '.'

vi.mock('@core/journeys/ui/useRouteChangeState', async () => ({
  useRouteChangeState: vi.fn(() => false)
}))

vi.mock('../../../libs/useTemplateFamilyStatsAggregateLazyQuery', async () => ({
  useTemplateFamilyStatsAggregateLazyQuery: vi.fn(),
  extractTemplateIdsFromJourneys: (
    await vi.importActual(
      '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
    )
  ).extractTemplateIdsFromJourneys
}))

const mockedUseTemplateFamilyStatsAggregateLazyQuery =
  useTemplateFamilyStatsAggregateLazyQuery as MockedFunction<
    typeof useTemplateFamilyStatsAggregateLazyQuery
  >

vi.mock('next/router', async () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({ query: { tab: 'active' } }))
}))

const activeJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [defaultJourney, oldJourney]
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
      status: [JourneyStatus.draft, JourneyStatus.published],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('ActiveJourneyList', () => {
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

  it('should ask users to add a new journey', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[noJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ActiveJourneyList />
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
  })

  describe('Archive All', () => {
    it('should display the archive all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList event="archiveAllActive" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Archive Journeys')).toBeInTheDocument()
      )
    })

    const result = vi.fn(() => ({
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

    it('should archive all journeys', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[activeJourneysMock, archiveJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList
                event="archiveAllActive"
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
      fireEvent.click(getByRole('button', { name: 'Archive' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByRole, getByText } = render(
        <MockedProvider
          mocks={[
            activeJourneysMock,
            { ...archiveJourneysMock, error: new Error('error') }
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList
                event="archiveAllActive"
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
      fireEvent.click(getByRole('button', { name: 'Archive' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })
  })

  describe('Trash All', () => {
    const result = vi.fn(() => ({
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

    it('should display the trash all dialog', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList
                event="trashAllActive"
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
        expect(getByText('Trash Journeys')).toBeInTheDocument()
      )
    })

    it('should trash all journeys', async () => {
      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[activeJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList
                event="trashAllActive"
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
      fireEvent.click(getByRole('button', { name: 'Trash' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      const { getByText, getByRole } = render(
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
                  event="trashAllActive"
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
      fireEvent.click(getByRole('button', { name: 'Trash' }))
      await waitFor(() => expect(getByText('error')).toBeInTheDocument())
    })

    it('should call refetchTemplateStats when trashing journeys with fromTemplateId', async () => {
      const result = vi.fn(() => ({
        data: {
          journeysTrash: [
            {
              id: defaultJourney.id,
              status: 'archived',
              fromTemplateId: 'template-1'
            },
            {
              id: oldJourney.id,
              status: 'archived',
              fromTemplateId: 'template-2'
            }
          ]
        }
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

      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[activeJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ActiveJourneyList
                event="trashAllActive"
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
