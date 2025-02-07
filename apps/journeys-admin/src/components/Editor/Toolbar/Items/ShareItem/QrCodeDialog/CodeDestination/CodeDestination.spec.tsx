import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act, Suspense } from 'react'
import { QrCodeFields as QrCode } from '../../../../../../../../__generated__/QrCodeFields'

import { CodeDestination, GET_USER_PERMISSIONS } from './CodeDestination'
import { GetUserRole } from '../../../../../../../../__generated__/GetUserRole'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import {
  Role,
  UserJourneyRole,
  UserTeamRole
} from 'libs/journeys/ui/__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import {
  GetUserPermissions,
  GetUserPermissionsVariables
} from '../../../../../../../../__generated__/GetUserPermissions'

jest.mock('../../../../../../../libs/useCurrentUserLazyQuery', () => ({
  __esModule: true,
  useCurrentUserLazyQuery: jest.fn()
}))
const mockUseCurrentUserLazyQuery = useCurrentUserLazyQuery as jest.Mock

const user = { id: 'user.id', email: 'test@email.com' }

describe('CodeDestination', () => {
  beforeEach(() => {
    mockUseCurrentUserLazyQuery.mockReturnValue({
      loadUser: jest.fn(),
      data: user
    })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  const qrCode: QrCode = {
    __typename: 'QrCode',
    id: 'qrCode.id',
    toJourneyId: 'journey.id',
    shortLink: {
      __typename: 'ShortLink',
      id: 'shortLink.id',
      domain: {
        __typename: 'ShortLinkDomain',
        hostname: 'localhost'
      },
      pathname: 'shortId',
      to: 'http://localhost:4100/destinationUrl?utm_source=ns-qr-code&utm_campaign=$shortLink.id'
    }
  }

  const to = 'http://localhost:4100/destinationUrl'

  function getUserRoleMock(roles?: [Role]): MockedResponse<GetUserRole> {
    return {
      request: {
        query: GET_USER_ROLE
      },
      result: jest.fn(() => ({
        data: {
          getUserRole: {
            __typename: 'UserRole',
            id: 'user.id',
            roles: roles ?? []
          }
        }
      }))
    }
  }

  function getUserPermissionsMock(
    template: boolean,
    teamRole: UserTeamRole,
    journeyRole: UserJourneyRole
  ): MockedResponse<GetUserPermissions, GetUserPermissionsVariables> {
    return {
      request: {
        query: GET_USER_PERMISSIONS,
        variables: {
          id: 'journey.id'
        }
      },
      result: jest.fn(() => ({
        data: {
          adminJourney: {
            __typename: 'Journey',
            id: 'journey.id',
            template,
            team: {
              __typename: 'Team',
              id: 'team.id',
              userTeams: [
                {
                  __typename: 'UserTeam',
                  id: 'userTeam.id',
                  role: teamRole,
                  user: {
                    __typename: 'User',
                    email: 'test@email.com'
                  }
                }
              ]
            },
            userJourneys: [
              {
                __typename: 'UserJourney',
                id: 'userJourney.id',
                role: journeyRole,
                user: {
                  __typename: 'User',
                  email: 'test@email.com'
                }
              }
            ]
          }
        }
      }))
    }
  }

  it('should display the code destination', async () => {
    const roleMock = getUserRoleMock()
    const permissionsMock = getUserPermissionsMock(
      false,
      UserTeamRole.member,
      UserJourneyRole.editor
    )

    render(
      <MockedProvider mocks={[roleMock, permissionsMock]}>
        <Suspense>
          <CodeDestination
            journeyId="journey.id"
            qrCode={qrCode}
            to={to}
            handleUpdateTo={jest.fn()}
          />
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue(to))

    expect(screen.getAllByRole('button', { name: 'Change' })[0]).toBeDisabled()
  })

  it('should change code destination if user is journey owner', async () => {
    const handleUpdateTo = jest.fn()
    const roleMock = getUserRoleMock()
    const permissionsMock = getUserPermissionsMock(
      false,
      UserTeamRole.member,
      UserJourneyRole.owner
    )

    render(
      <MockedProvider mocks={[roleMock, permissionsMock]}>
        <Suspense>
          <CodeDestination
            journeyId="journey.id"
            qrCode={qrCode}
            to={to}
            handleUpdateTo={handleUpdateTo}
          />
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Change' })[0]
      ).not.toBeDisabled()
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: 'http://localhost:4100/newUrl' }
    })
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Redirect' })[0])
    })

    expect(handleUpdateTo).toHaveBeenCalled()
  })

  it('should change code destination if user is team manager', async () => {
    const handleUpdateTo = jest.fn()
    const roleMock = getUserRoleMock()
    const permissionsMock = getUserPermissionsMock(
      false,
      UserTeamRole.manager,
      UserJourneyRole.editor
    )

    render(
      <MockedProvider mocks={[roleMock, permissionsMock]}>
        <Suspense>
          <CodeDestination
            journeyId="journey.id"
            qrCode={qrCode}
            to={to}
            handleUpdateTo={handleUpdateTo}
          />
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Change' })[0]
      ).not.toBeDisabled()
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: 'http://localhost:4100/newUrl' }
    })
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Redirect' })[0])
    })

    expect(handleUpdateTo).toHaveBeenCalled()
  })

  it('should change code destination if user is template publisher', async () => {
    const handleUpdateTo = jest.fn()
    const roleMock = getUserRoleMock([Role.publisher])
    const permissionsMock = getUserPermissionsMock(
      true,
      UserTeamRole.member,
      UserJourneyRole.editor
    )

    render(
      <MockedProvider mocks={[roleMock, permissionsMock]}>
        <Suspense>
          <CodeDestination
            journeyId="journey.id"
            qrCode={qrCode}
            to={to}
            handleUpdateTo={handleUpdateTo}
          />
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Change' })[0]
      ).not.toBeDisabled()
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: 'http://localhost:4100/newUrl' }
    })
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Redirect' })[0])
    })

    expect(handleUpdateTo).toHaveBeenCalled()
  })

  it('should not update code destination if it is the same as the original', async () => {
    const handleUpdateTo = jest.fn()
    const roleMock = getUserRoleMock()
    const permissionsMock = getUserPermissionsMock(
      false,
      UserTeamRole.member,
      UserJourneyRole.owner
    )

    render(
      <MockedProvider mocks={[roleMock, permissionsMock]}>
        <Suspense>
          <CodeDestination
            journeyId="journey.id"
            qrCode={qrCode}
            to={to}
            handleUpdateTo={handleUpdateTo}
          />
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Change' })[0]
      ).not.toBeDisabled()
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: to }
    })
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Redirect' })[0])
    })

    await waitFor(() => expect(handleUpdateTo).not.toHaveBeenCalled())
  })

  it('should undo the code destination change', async () => {
    const handleUpdateTo = jest.fn()
    const roleMock = getUserRoleMock()
    const permissionsMock = getUserPermissionsMock(
      false,
      UserTeamRole.member,
      UserJourneyRole.owner
    )

    render(
      <MockedProvider mocks={[roleMock, permissionsMock]}>
        <Suspense>
          <CodeDestination
            journeyId="journey.id"
            qrCode={qrCode}
            to={to}
            handleUpdateTo={handleUpdateTo}
          />
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Change' })[0]
      ).not.toBeDisabled()
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: 'http://localhost:4100/newUrl' }
    })
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Redirect' })[0])
    })

    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Undo changes' }))
    )

    expect(handleUpdateTo).toHaveBeenCalledTimes(2)
  })

  it('should reset destination to original to if update error', async () => {
    const handleUpdateTo = jest.fn(() => {
      throw new Error('Update failed')
    })
    const roleMock = getUserRoleMock()
    const permissionsMock = getUserPermissionsMock(
      false,
      UserTeamRole.member,
      UserJourneyRole.owner
    )

    render(
      <MockedProvider mocks={[roleMock, permissionsMock]}>
        <Suspense>
          <CodeDestination
            journeyId="journey.id"
            qrCode={qrCode}
            to={to}
            handleUpdateTo={handleUpdateTo}
          />
        </Suspense>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: 'Change' })[0]
      ).not.toBeDisabled()
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    const textbox = screen.getByRole('textbox')
    fireEvent.change(textbox, {
      target: { value: 'http://localhost:4100/newUrl' }
    })
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'Redirect' })[0])
    })

    expect(screen.getByRole('textbox')).toHaveValue(to)
  })
})
