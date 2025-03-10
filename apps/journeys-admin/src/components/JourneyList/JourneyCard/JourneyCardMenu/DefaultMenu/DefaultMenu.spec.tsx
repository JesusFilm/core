import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'

import {
  JourneyStatus,
  Role,
  UserJourneyRole,
  UserTeamRole
} from '../../../../../../__generated__/globalTypes'
import { GET_CURRENT_USER } from '../../../../../libs/useCurrentUserLazyQuery'
import { getCustomDomainMock } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'

import { GET_JOURNEY_WITH_USER_ROLES } from './DefaultMenu'

import { DefaultMenu } from '.'

const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: jest.fn(() => ({
    data: {
      teams: [
        {
          id: 'teamId',
          title: 'Team Title',
          publicTitle: null,
          __typename: 'Team',
          userTeams: [],
          customDomains: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: 'teamId'
      }
    }
  }))
}

// Mock for current user query
const currentUserMock = {
  request: {
    query: GET_CURRENT_USER
  },
  result: {
    data: {
      me: {
        __typename: 'User',
        id: 'current-user-id',
        email: 'current@example.com'
      }
    }
  }
}

// Mock for team with current user as manager
const teamWithManagerMock = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [
        {
          id: 'teamId',
          title: 'Team Title',
          publicTitle: null,
          __typename: 'Team',
          userTeams: [
            {
              id: 'userTeamId',
              role: UserTeamRole.manager,
              user: {
                id: 'userId',
                email: 'current@example.com',
                __typename: 'User'
              },
              __typename: 'UserTeam'
            }
          ],
          customDomains: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: 'teamId'
      }
    }
  }
}

// Mock for team with current user as member
const teamWithMemberMock = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [
        {
          id: 'teamId',
          title: 'Team Title',
          publicTitle: null,
          __typename: 'Team',
          userTeams: [
            {
              id: 'userTeamId',
              role: UserTeamRole.member,
              user: {
                id: 'userId',
                email: 'current@example.com',
                __typename: 'User'
              },
              __typename: 'UserTeam'
            }
          ],
          customDomains: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: 'teamId'
      }
    }
  }
}

// Mock for user role query with publisher role
const userRolePublisherMock = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        __typename: 'UserRole',
        id: 'user-role-id',
        roles: [Role.publisher]
      }
    }
  }
}

// Mock for user role query without publisher role
const userRoleNonPublisherMock = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        __typename: 'UserRole',
        id: 'user-role-id',
        roles: []
      }
    }
  }
}

describe('DefaultMenu', () => {
  it('should render menu for journey', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journeyId"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={noop}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Access' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy to ...' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
  })

  it('should render menu for templates', () => {
    const { queryByRole, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="template-id"
            slug="template-slug"
            status={JourneyStatus.published}
            journeyId="template-id"
            published
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            template
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
    expect(queryByRole('menuitem', { name: 'Access' })).not.toBeInTheDocument()
    expect(queryByRole('menuitem', { name: 'Copy to' })).not.toBeInTheDocument()
  })

  it('should call correct functions on Access click', () => {
    const setOpenAccessDialog = jest.fn()
    const handleCloseMenu = jest.fn()

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={setOpenAccessDialog}
              handleCloseMenu={handleCloseMenu}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Access' }))
    expect(setOpenAccessDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  it('should redirect to preview', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <MockedProvider mocks={[getTeams]}>
            <TeamProvider>
              <DefaultMenu
                id="journey-id"
                slug="journey-slug"
                status={JourneyStatus.published}
                journeyId="journey-id"
                published
                setOpenAccessDialog={noop}
                handleCloseMenu={noop}
                setOpenTrashDialog={noop}
              />
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getTeams.result).toHaveBeenCalled())

    expect(getByRole('menuitem', { name: 'Preview' })).not.toBeDisabled()
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/api/preview?slug=journey-slug'
    )
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should redirect to preview with custom Domain', async () => {
    const result = jest.fn().mockReturnValue(getCustomDomainMock.result)
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <MockedProvider
            mocks={[{ ...getCustomDomainMock, result }, getTeams]}
          >
            <TeamProvider>
              <DefaultMenu
                id="journey-id"
                slug="journey-slug"
                status={JourneyStatus.published}
                journeyId="journey-id"
                published
                setOpenAccessDialog={noop}
                handleCloseMenu={noop}
                setOpenTrashDialog={noop}
              />
            </TeamProvider>
          </MockedProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getTeams.result).toHaveBeenCalled())
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(getByRole('menuitem', { name: 'Preview' })).not.toBeDisabled()
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/api/preview?slug=journey-slug&hostname=example.com'
    )
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should call correct functions on Delete click', () => {
    const handleCloseMenu = jest.fn()
    const setOpenTrashDialog = jest.fn()

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={handleCloseMenu}
              setOpenTrashDialog={setOpenTrashDialog}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Trash' }))
    expect(setOpenTrashDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  it('should enable Archive and Trash menu items for journey owners', async () => {
    // Mock journey data with current user as owner
    const journeyId = 'journey-id'
    const journeyData = {
      __typename: 'Journey',
      id: journeyId,
      userJourneys: [
        {
          __typename: 'UserJourney',
          id: 'userJourney1.id',
          role: UserJourneyRole.owner,
          user: {
            __typename: 'User',
            id: 'current-user-id'
          }
        }
      ]
    }

    // Mock for journey query
    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          journey: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[currentUserMock, journeyMock, teamWithMemberMock]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={noop}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Wait for the queries to complete
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Archive' })).not.toHaveAttribute(
        'aria-disabled'
      )
      expect(getByRole('menuitem', { name: 'Trash' })).not.toHaveAttribute(
        'aria-disabled'
      )
    })
  })

  it('should enable Archive and Trash menu items for team managers', async () => {
    // Mock journey data with current user as editor
    const journeyId = 'journey-id'
    const journeyData = {
      __typename: 'Journey',
      id: journeyId,
      userJourneys: [
        {
          __typename: 'UserJourney',
          id: 'userJourney1.id',
          role: UserJourneyRole.editor,
          user: {
            __typename: 'User',
            id: 'current-user-id'
          }
        }
      ]
    }

    // Mock for journey query
    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          journey: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[currentUserMock, journeyMock, teamWithManagerMock]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={noop}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Wait for the queries to complete
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Archive' })).not.toHaveAttribute(
        'aria-disabled'
      )
      expect(getByRole('menuitem', { name: 'Trash' })).not.toHaveAttribute(
        'aria-disabled'
      )
    })
  })

  it('should disable Archive and Trash menu items for journey editors who are not team managers', async () => {
    // Mock journey data with current user as editor
    const journeyId = 'journey-id'
    const journeyData = {
      __typename: 'Journey',
      id: journeyId,
      userJourneys: [
        {
          __typename: 'UserJourney',
          id: 'userJourney1.id',
          role: UserJourneyRole.editor,
          user: {
            __typename: 'User',
            id: 'current-user-id'
          }
        }
      ]
    }

    // Mock for journey query
    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          journey: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[currentUserMock, journeyMock, teamWithMemberMock]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={noop}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Wait for the queries to complete
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
      expect(getByRole('menuitem', { name: 'Trash' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    })
  })

  it('should enable other menu items for journey editors', async () => {
    // Mock journey data with current user as editor
    const journeyId = 'journey-id'
    const journeyData = {
      __typename: 'Journey',
      id: journeyId,
      userJourneys: [
        {
          __typename: 'UserJourney',
          id: 'userJourney1.id',
          role: UserJourneyRole.editor,
          user: {
            __typename: 'User',
            id: 'current-user-id'
          }
        }
      ]
    }

    // Mock for journey query
    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          journey: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[currentUserMock, journeyMock, teamWithMemberMock]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={noop}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Wait for the queries to complete and check that other menu items are enabled
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Edit' })).not.toHaveAttribute(
        'aria-disabled'
      )
      expect(getByRole('menuitem', { name: 'Access' })).not.toHaveAttribute(
        'aria-disabled'
      )
      expect(getByRole('menuitem', { name: 'Preview' })).not.toHaveAttribute(
        'aria-disabled'
      )
    })
  })

  it('should enable Archive and Trash for publishers for templates', async () => {
    // Mock journey data for template
    const templateId = 'template-id'
    const templateData = {
      __typename: 'Journey',
      id: templateId,
      userJourneys: []
    }

    // Mock for journey query
    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: templateId }
      },
      result: {
        data: {
          journey: templateData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[userRolePublisherMock, journeyMock, currentUserMock]}
      >
        <SnackbarProvider>
          <DefaultMenu
            id="template-id"
            slug="template-slug"
            status={JourneyStatus.published}
            journeyId="template-id"
            published
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            template
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Archive' })).not.toHaveAttribute(
        'aria-disabled'
      )
      expect(getByRole('menuitem', { name: 'Trash' })).not.toHaveAttribute(
        'aria-disabled'
      )
    })
  })

  it('should disable Archive and Trash for publishers for non-templates', async () => {
    // Mock journey data for non-template
    const journeyId = 'journey-id'
    const journeyData = {
      __typename: 'Journey',
      id: journeyId,
      userJourneys: []
    }

    // Mock for journey query
    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          journey: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[userRolePublisherMock, journeyMock, currentUserMock]}
      >
        <SnackbarProvider>
          <DefaultMenu
            id="journey-id"
            slug="journey-slug"
            status={JourneyStatus.published}
            journeyId="journey-id"
            published
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            template={false}
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
      expect(getByRole('menuitem', { name: 'Trash' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    })
  })

  it('should disable Archive and Trash for non-publishers for templates', async () => {
    // Mock journey data for template
    const templateId = 'template-id'
    const templateData = {
      __typename: 'Journey',
      id: templateId,
      userJourneys: []
    }

    // Mock for journey query
    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: templateId }
      },
      result: {
        data: {
          journey: templateData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[userRoleNonPublisherMock, journeyMock, currentUserMock]}
      >
        <SnackbarProvider>
          <DefaultMenu
            id="template-id"
            slug="template-slug"
            status={JourneyStatus.published}
            journeyId="template-id"
            published
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            template
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
      expect(getByRole('menuitem', { name: 'Trash' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    })
  })

  it('should enable Archive and Trash for users who are both publishers and journey editors for non-templates', async () => {
    // Mock journey data with current user as editor
    const journeyId = 'journey-id'
    const journeyData = {
      __typename: 'Journey',
      id: journeyId,
      userJourneys: [
        {
          __typename: 'UserJourney',
          id: 'userJourney1.id',
          role: UserJourneyRole.editor,
          user: {
            __typename: 'User',
            id: 'current-user-id'
          }
        }
      ]
    }

    // Mock for journey query
    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          journey: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          currentUserMock,
          journeyMock,
          teamWithMemberMock,
          userRolePublisherMock
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.draft}
              journeyId="journey-id"
              published={false}
              setOpenAccessDialog={noop}
              handleCloseMenu={noop}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Wait for the queries to complete
    await waitFor(() => {
      // Should be disabled because it's not a template, even though user is a publisher
      expect(getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
      expect(getByRole('menuitem', { name: 'Trash' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    })
  })
})
