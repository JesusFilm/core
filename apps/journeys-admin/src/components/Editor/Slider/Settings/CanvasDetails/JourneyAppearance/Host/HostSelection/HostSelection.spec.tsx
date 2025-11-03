import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { HostSelection } from './HostSelection'

describe('HostSelection', () => {
  const user = {
    id: 'userId',
    email: 'admin@email.com'
  }

  const userTeam: UserTeam = {
    id: 'teamId',
    __typename: 'UserTeam',
    role: UserTeamRole.manager,
    user: {
      __typename: 'User',
      email: user.email,
      firstName: 'User',
      id: user.id,
      imageUrl: 'imageURL',
      lastName: '1'
    }
  }

  const defaultHost: Host = {
    id: 'hostId',
    __typename: 'Host' as const,
    title: 'Cru International',
    location: 'Florida, USA',
    src1: 'https://tinyurl.com/3bxusmyb',
    src2: null
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost,
    team: { id: userTeam.id, title: 'My team' },
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'LanguageName'
        }
      ]
    }
  } as unknown as Journey

  const data: GetUserTeamsAndInvites = {
    userTeams: [userTeam],
    userTeamInvites: []
  }

  it('should render default host selection', async () => {
    const handleSelection = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{ journey: { ...journey, host: null }, variant: 'admin' }}
          >
            <HostSelection
              data={data}
              userInTeam
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: 'Select a Host' })).not.toBeDisabled()
    })
  })

  it('should render host details', () => {
    const handleSelection = jest.fn()
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{ journey: { ...journey }, variant: 'admin' }}
          >
            <HostSelection
              data={data}
              userInTeam
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByText('Cru International')).toBeInTheDocument()
    expect(getByText('Florida, USA')).toBeInTheDocument()
    expect(getByTestId('Edit2Icon')).toBeInTheDocument()
  })

  it('should disable editing hosts if no team on journey', async () => {
    const handleSelection = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, team: null, host: null },
              variant: 'admin'
            }}
          >
            <HostSelection
              data={data}
              userInTeam={false}
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: 'Select a Host' })).toBeDisabled()
    })
  })

  it('should disable editing hosts if current user does not have access', async () => {
    const handleSelection = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSelection
              data={data}
              userInTeam={false}
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Select a Host' })).toBeDisabled()
    expect(getByText('Only My team members can edit this')).toBeInTheDocument()
  })

  it('should disable editing hosts if no users have access in team', async () => {
    const handleSelection = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostSelection
              data={{ userTeams: [], userTeamInvites: [] }}
              userInTeam={false}
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('button', { name: 'Select a Host' })).toBeDisabled()
      expect(
        getByText('Cannot edit hosts for this old journey')
      ).toBeInTheDocument()
    })
  })

  it('should call handleselection on list', async () => {
    const handleSelection = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{ journey: { ...journey, host: null }, variant: 'admin' }}
          >
            <HostSelection
              data={data}
              userInTeam
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Select a Host' }))
    await waitFor(() => {
      expect(handleSelection).toHaveBeenCalledWith('list')
    })
  })

  it('should call handleselection on form', async () => {
    const handleSelection = jest.fn()
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{ journey: { ...journey }, variant: 'admin' }}
          >
            <HostSelection
              data={data}
              userInTeam
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('Edit2Icon'))
    await waitFor(() => {
      expect(handleSelection).toHaveBeenCalledWith('form')
    })
  })
})
