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
import { ThemeProvider } from '../../../../ThemeProvider'

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

const currentUserMock = {
  request: {
    query: GET_CURRENT_USER
  },
  result: {
    data: {
      me: {
        __typename: 'User',
        id: 'current-user-id',
        email: 'current@example.com',
        lastName: 'userLastName',
        firstName: 'userFirstName',
        imageUrl: 'https://example.com/image.jpg'
      }
    }
  }
}

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
                lastName: 'userLastName',
                firstName: 'userFirstName',
                imageUrl: 'https://example.com/image.jpg',
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
                lastName: 'userLastName',
                firstName: 'userFirstName',
                imageUrl: 'https://example.com/image.jpg',
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

// Simple team mock to ensure Archive/Trash menu items appear
const teamMock = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      getJourneyProfile: {
        id: 'profileId',
        lastActiveTeamId: 'teamId',
        __typename: 'JourneyProfile'
      },
      teams: [
        {
          id: 'teamId',
          title: 'Test Team',
          publicTitle: 'Test Team Public',
          userTeams: [
            {
              id: 'userTeamId',
              user: {
                id: 'userId',
                firstName: 'Test',
                lastName: 'User',
                imageUrl: null,
                email: 'test@example.com',
                __typename: 'User'
              },
              role: UserTeamRole.manager,
              __typename: 'UserTeam'
            }
          ],
          customDomains: [],
          __typename: 'Team'
        }
      ]
    }
  }
}

describe('DefaultMenu', () => {
  it('should render menu for journey', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[teamWithManagerMock]}>
        <SnackbarProvider>
          <ThemeProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Edit Details' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Access' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Share' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy to ...' })).toBeInTheDocument()
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    })
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
  })

  it('should render menu for templates', async () => {
    const { queryByRole, getByRole } = render(
      <MockedProvider mocks={[teamMock, userRolePublisherMock]}>
        <SnackbarProvider>
          <ThemeProvider>
            <TeamProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('menuitem', { name: 'Edit Details' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    await waitFor(() => {
      expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    })
    expect(getByRole('menuitem', { name: 'Share' })).toBeInTheDocument()
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
          <ThemeProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
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
          <ThemeProvider>
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
                  setOpenDetailsDialog={noop}
                />
              </TeamProvider>
            </MockedProvider>
          </ThemeProvider>
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
          <ThemeProvider>
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
                  setOpenDetailsDialog={noop}
                />
              </TeamProvider>
            </MockedProvider>
          </ThemeProvider>
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

  it('should call correct functions on Delete click', async () => {
    const handleCloseMenu = jest.fn()
    const setOpenTrashDialog = jest.fn()

    const { getByRole } = render(
      <MockedProvider mocks={[teamMock]}>
        <SnackbarProvider>
          <ThemeProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      fireEvent.click(getByRole('menuitem', { name: 'Trash' }))
    })

    expect(setOpenTrashDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  it('should enable Archive and Trash menu items for journey owners', async () => {
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
            id: 'current-user-id',
            email: 'current@example.com'
          }
        }
      ]
    }

    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          adminJourney: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[currentUserMock, journeyMock, teamWithManagerMock]}
      >
        <SnackbarProvider>
          <ThemeProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
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

  it('should enable Archive and Trash menu items for team managers', async () => {
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

    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          adminJourney: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[currentUserMock, journeyMock, teamWithManagerMock]}
      >
        <SnackbarProvider>
          <ThemeProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
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

  it('should disable Archive and Trash menu items for journey editors who are not team managers', async () => {
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

    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          adminJourney: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[currentUserMock, journeyMock, teamWithMemberMock]}
      >
        <SnackbarProvider>
          <ThemeProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
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

  it('should enable other menu items for journey editors', async () => {
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

    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          adminJourney: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[currentUserMock, journeyMock, teamWithMemberMock]}
      >
        <SnackbarProvider>
          <ThemeProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        getByRole('menuitem', { name: 'Edit Details' })
      ).not.toHaveAttribute('aria-disabled')
      expect(getByRole('menuitem', { name: 'Access' })).not.toHaveAttribute(
        'aria-disabled'
      )
      expect(getByRole('menuitem', { name: 'Preview' })).not.toHaveAttribute(
        'aria-disabled'
      )
    })
  })

  it('should enable Archive and Trash for publishers for templates', async () => {
    const templateId = 'template-id'
    const templateData = {
      __typename: 'Journey',
      id: templateId,
      userJourneys: []
    }

    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: templateId }
      },
      result: {
        data: {
          adminJourney: templateData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[userRolePublisherMock, journeyMock, currentUserMock, teamMock]}
      >
        <SnackbarProvider>
          <ThemeProvider>
            <TeamProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
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
    const journeyId = 'journey-id'
    const journeyData = {
      __typename: 'Journey',
      id: journeyId,
      userJourneys: []
    }

    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          adminJourney: journeyData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[userRolePublisherMock, journeyMock, currentUserMock, teamMock]}
      >
        <SnackbarProvider>
          <ThemeProvider>
            <TeamProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
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
    const templateId = 'template-id'
    const templateData = {
      __typename: 'Journey',
      id: templateId,
      userJourneys: []
    }

    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: templateId }
      },
      result: {
        data: {
          adminJourney: templateData
        }
      }
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          userRoleNonPublisherMock,
          journeyMock,
          currentUserMock,
          teamMock
        ]}
      >
        <SnackbarProvider>
          <ThemeProvider>
            <TeamProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
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

    const journeyMock = {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: journeyId }
      },
      result: {
        data: {
          adminJourney: journeyData
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
          <ThemeProvider>
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
                setOpenDetailsDialog={noop}
              />
            </TeamProvider>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

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
