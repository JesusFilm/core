import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { useCurrentUser } from '../../../../../../../libs/useCurrentUser'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { HostSidePanel } from './HostSidePanel'

const user1 = { id: 'userId', email: 'admin@email.com' }

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('../../../../../../../libs/useCurrentUser', () => ({
  __esModule: true,
  useCurrentUser: jest.fn()
}))

const useCurrentUserMock = useCurrentUser as jest.Mock

describe('HostSidePanel', () => {
  beforeEach(() => {
    useCurrentUserMock.mockReturnValue({ loadUser: jest.fn(), data: user1 })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  const userTeam: UserTeam = {
    id: 'teamId',
    __typename: 'UserTeam',
    role: UserTeamRole.manager,
    user: {
      __typename: 'User',
      email: user1.email,
      firstName: 'User',
      id: user1.id,
      imageUrl: 'imageURL',
      lastName: '1'
    }
  }

  const defaultHost = {
    id: 'hostId',
    __typename: 'Host',
    teamId: userTeam.id,
    title: 'Cru International',
    location: 'Florida, USA',
    src1: 'imageSrc1',
    src2: 'imageSrc2'
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost,
    team: { id: userTeam.id, title: 'My team' }
  } as unknown as Journey

  const getUserTeamMock: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: {
        teamId: userTeam.id,
        where: { role: [UserTeamRole.manager, UserTeamRole.member] }
      }
    },
    result: {
      data: {
        userTeams: [userTeam],
        userTeamInvites: []
      }
    }
  }

  it('should render the default host side panel', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })
  })

  it('should disable editing hosts if no team on journey', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, team: null, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).toBeDisabled()
    })
  })

  it('should disable editing hosts if current user does not have access', async () => {
    useCurrentUserMock.mockReturnValue({
      loadUser: jest.fn(),
      data: { id: 'otherUser', email: 'otherUser@test.com' }
    })

    const { getAllByRole, getAllByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).toBeDisabled()
      expect(
        getAllByText(`Only My team members can edit this`)[0]
      ).toBeInTheDocument()
    })
  })

  it('should disable editing hosts if no users have access in team', async () => {
    const { getAllByRole, getAllByText } = render(
      <MockedProvider
        mocks={[
          {
            ...getUserTeamMock,
            result: { data: { userTeams: [], userTeamInvites: [] } }
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).toBeDisabled()
      expect(
        getAllByText('This old journey cannot edit hosts')[0]
      ).toBeInTheDocument()
    })
  })

  it('should navigate to the select host side panel', async () => {
    const { getAllByRole, getAllByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })

    fireEvent.click(getAllByRole('button', { name: 'Select a Host' })[0])

    await waitFor(() => {
      expect(getAllByText('Authors')[0]).toBeInTheDocument()
    })
  })

  it('should navigate to the info side panel', async () => {
    const { getAllByRole, getAllByText, getAllByTestId } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })

    fireEvent.click(getAllByRole('button', { name: 'Select a Host' })[0])

    await waitFor(() => {
      expect(getAllByText('Authors')[0]).toBeInTheDocument()
    })

    fireEvent.click(getAllByTestId('info')[0])

    await waitFor(() => {
      expect(getAllByText('Information')[0]).toBeInTheDocument()
    })
  })

  it('should render the edit host panel', async () => {
    const { getAllByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getAllByText('Edit Author')[0]).toBeInTheDocument()
    })
  })

  it('should navigate to the create host panel', async () => {
    const { getAllByRole, getAllByText } = render(
      <MockedProvider mocks={[getUserTeamMock]}>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSidePanel />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: 'Select a Host' })[0]
      ).not.toBeDisabled()
    })

    fireEvent.click(getAllByRole('button', { name: 'Select a Host' })[0])

    await waitFor(() => {
      expect(getAllByText('Authors')[0]).toBeInTheDocument()
    })

    fireEvent.click(getAllByRole('button', { name: 'Create New' })[0])

    await waitFor(() => {
      expect(getAllByText('Create Author')[0]).toBeInTheDocument()
    })
  })
})
