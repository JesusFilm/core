import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { ThemeProvider } from '../../ThemeProvider'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../JourneyListContent/JourneyListContent'
import { defaultJourney, fakeDate, oldJourney } from '../journeyListData'
import { SortOrder } from '../JourneySort'

import { ArchivedJourneyList } from '.'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

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

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const archivedJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
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
      status: [JourneyStatus.archived],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('ArchivedJourneyList', () => {
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

  it('should render journeys in descending updatedAt date by default', async () => {
    render(
      <MockedProvider mocks={[archivedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedJourneyList />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getAllByLabelText('journey-card')[0].textContent).toContain(
        '11 months ago'
      )
    )
    expect(screen.getAllByLabelText('journey-card')[1].textContent).toContain(
      '1 year ago'
    )
  })

  it('should order journeys in alphabetical order', async () => {
    const lowerCaseJourneyTitle = {
      ...defaultJourney,
      title: 'a lower case title'
    }
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS,
              variables: {
                status: [JourneyStatus.archived],
                useLastActiveTeamId: true
              }
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
            <ArchivedJourneyList sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getAllByLabelText('journey-card')[0].textContent).toContain(
        'a lower case titleEnglish•11 months ago00'
      )
    )
    expect(screen.getAllByLabelText('journey-card')[1].textContent).toContain(
      'An Old Journey HeadingEnglish•1 year ago00'
    )
  })

  describe('Unarchive All', () => {
    const result = jest.fn(() => ({
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
    const archiveJourneysMock = {
      request: {
        query: RESTORE_ARCHIVED_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }

    it('should display the unarchive all dialog', async () => {
      render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedJourneyList event="restoreAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(screen.getByText('Unarchive Journeys')).toBeInTheDocument()
      )
    })

    it('should unarchive all journeys', async () => {
      render(
        <MockedProvider
          mocks={[archivedJourneysMock, archiveJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedJourneyList
                event="restoreAllArchived"
                user={{ id: 'user-id1' } as unknown as User}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByText('Unarchive'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      render(
        <MockedProvider
          mocks={[
            archivedJourneysMock,
            { ...archiveJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ArchivedJourneyList
                  event="restoreAllArchived"
                  user={{ id: 'user-id1' } as unknown as User}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByText('Unarchive'))
      await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument())
    })

    it('should show "No journeys have been restored" when no journeys to restore', async () => {
      render(
        <MockedProvider mocks={[noJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedJourneyList
                event="restoreAllArchived"
                user={{ id: 'user-id1' } as unknown as User}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(screen.getByText('Unarchive Journeys')).toBeInTheDocument()
      )

      fireEvent.click(screen.getByRole('button', { name: 'Unarchive' }))

      await waitFor(() =>
        expect(
          screen.getByText('No journeys have been restored')
        ).toBeInTheDocument()
      )
    })

    it('should call refetchTemplateStats when restoring journeys with fromTemplateId', async () => {
      render(
        <MockedProvider
          mocks={[archivedJourneysMock, archiveJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedJourneyList
                event="restoreAllArchived"
                user={{ id: 'user-id1' } as unknown as User}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByText('Unarchive'))
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
            id: defaultJourney.id,
            status: 'trashAllArchived',
            fromTemplateId: 'template-1'
          },
          {
            id: oldJourney.id,
            status: 'trashAllArchived',
            fromTemplateId: 'template-2'
          }
        ]
      }
    }))
    const trashJourneysMock = {
      request: {
        query: TRASH_ARCHIVED_JOURNEYS,
        variables: {
          ids: [defaultJourney.id, oldJourney.id]
        }
      },
      result
    }

    it('should display the trash all dialog', async () => {
      render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedJourneyList event="trashAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(screen.getByText('Trash Journeys')).toBeInTheDocument()
      )
    })

    it('should trash all journeys', async () => {
      render(
        <MockedProvider
          mocks={[archivedJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedJourneyList
                event="trashAllArchived"
                user={{ id: 'user-id1' } as unknown as User}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole('button', { name: 'Trash' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should show error', async () => {
      render(
        <MockedProvider
          mocks={[
            archivedJourneysMock,
            { ...trashJourneysMock, error: new Error('error') }
          ]}
        >
          <SnackbarProvider>
            <ThemeProvider>
              <SnackbarProvider>
                <ArchivedJourneyList
                  event="trashAllArchived"
                  user={{ id: 'user-id1' } as unknown as User}
                />
              </SnackbarProvider>
            </ThemeProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole('button', { name: 'Trash' }))
      await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument())
    })

    it('should show "No journeys have been trashed" when no journeys to trash', async () => {
      render(
        <MockedProvider mocks={[noJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedJourneyList
                event="trashAllArchived"
                user={{ id: 'user-id1' } as unknown as User}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(screen.getByText('Trash Journeys')).toBeInTheDocument()
      )

      fireEvent.click(screen.getByRole('button', { name: 'Trash' }))

      await waitFor(() =>
        expect(
          screen.getByText('No journeys have been trashed')
        ).toBeInTheDocument()
      )
    })

    it('should call refetchTemplateStats when trashing journeys with fromTemplateId', async () => {
      render(
        <MockedProvider
          mocks={[archivedJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedJourneyList
                event="trashAllArchived"
                user={{ id: 'user-id1' } as unknown as User}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Default Journey Heading')).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole('button', { name: 'Trash' }))
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
