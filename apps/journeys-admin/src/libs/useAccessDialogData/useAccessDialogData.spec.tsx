import { GetJourneyWithPermissions } from '../../../__generated__/GetJourneyWithPermissions'
import {
  UserJourneyRole,
  UserTeamRole
} from '../../../__generated__/globalTypes'

import { useAccessDialogData } from './useAccessDialogData'
import {
  createMockInvite,
  createMockUserJourney,
  createMockUserTeam,
  mockGuestUser,
  mockOwnerUser,
  mockTeamMemberUser
} from './useAccessDialogData.mocks'

describe('useAccessDialogData', () => {
  describe('when no data is provided', () => {
    it('should return empty arrays and undefined values', () => {
      const result = useAccessDialogData(undefined, undefined, undefined)

      expect(result.currentUserJourney).toBeUndefined()
      expect(result.currentUserTeam).toBeUndefined()
      expect(result.enhancedTeamData).toBeUndefined()
      expect(result.guestUsers).toEqual([])
      expect(result.pendingRequests).toEqual([])
      expect(result.pendingInvites).toEqual([])
      expect(result.allEmails).toEqual([])
    })
  })

  describe('when current user is journey owner', () => {
    const mockData: GetJourneyWithPermissions = {
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        team: null,
        userJourneys: [
          createMockUserJourney(mockOwnerUser, UserJourneyRole.owner),
          createMockUserJourney(mockGuestUser, UserJourneyRole.editor)
        ]
      }
    }

    it('should identify current user as owner and create synthetic team data', () => {
      const result = useAccessDialogData(
        mockData,
        undefined,
        mockOwnerUser.email
      )

      expect(result.currentUserJourney?.role).toBe(UserJourneyRole.owner)
      expect(result.currentUserTeam).toBeUndefined()

      // Should create synthetic team with owner as manager
      expect(result.enhancedTeamData?.userTeams).toHaveLength(1)
      expect(result.enhancedTeamData?.userTeams[0].role).toBe(
        UserTeamRole.manager
      )
      expect(result.enhancedTeamData?.userTeams[0].user.email).toBe(
        mockOwnerUser.email
      )

      // Owner should not appear in guests
      expect(result.guestUsers).toHaveLength(1)
      expect(result.guestUsers[0].user?.email).toBe(mockGuestUser.email)
    })
  })

  describe('when current user is guest', () => {
    const mockData: GetJourneyWithPermissions = {
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        team: null,
        userJourneys: [
          createMockUserJourney(mockOwnerUser, UserJourneyRole.owner),
          createMockUserJourney(mockGuestUser, UserJourneyRole.editor)
        ]
      }
    }

    it('should identify current user as guest and show owner in team section', () => {
      const result = useAccessDialogData(
        mockData,
        undefined,
        mockGuestUser.email
      )

      expect(result.currentUserJourney?.role).toBe(UserJourneyRole.editor)
      expect(result.currentUserTeam).toBeUndefined()

      // Owner should be in synthetic team data as manager
      expect(result.enhancedTeamData?.userTeams).toHaveLength(1)
      expect(result.enhancedTeamData?.userTeams[0].user.email).toBe(
        mockOwnerUser.email
      )

      // Guest should appear in guests section
      expect(result.guestUsers).toHaveLength(1)
      expect(result.guestUsers[0].user?.email).toBe(mockGuestUser.email)
    })
  })

  describe('when journey has existing team', () => {
    const mockData: GetJourneyWithPermissions = {
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        team: {
          __typename: 'Team',
          id: 'team-id',
          userTeams: [
            createMockUserTeam(mockTeamMemberUser, UserTeamRole.manager)
          ]
        },
        userJourneys: [
          createMockUserJourney(mockOwnerUser, UserJourneyRole.owner),
          createMockUserJourney(mockGuestUser, UserJourneyRole.editor)
        ]
      }
    }

    it('should add synthetic owner to existing team when owner is not team member', () => {
      const result = useAccessDialogData(
        mockData,
        undefined,
        mockGuestUser.email
      )

      // Should have original team member + synthetic owner
      expect(result.enhancedTeamData?.userTeams).toHaveLength(2)

      // First should be synthetic owner (added first)
      expect(result.enhancedTeamData?.userTeams[0].user.email).toBe(
        mockOwnerUser.email
      )
      expect(result.enhancedTeamData?.userTeams[0].role).toBe(
        UserTeamRole.manager
      )

      // Second should be original team member
      expect(result.enhancedTeamData?.userTeams[1].user.email).toBe(
        mockTeamMemberUser.email
      )
    })

    it('should not duplicate owner when owner is already team member', () => {
      const dataWithOwnerInTeam: GetJourneyWithPermissions = {
        journey: {
          __typename: 'Journey',
          id: 'journey-id',
          team: {
            __typename: 'Team',
            id: 'team-id',
            userTeams: [
              createMockUserTeam(mockOwnerUser, UserTeamRole.manager), // Owner is already in team
              createMockUserTeam(mockTeamMemberUser, UserTeamRole.member)
            ]
          },
          userJourneys: [
            createMockUserJourney(mockOwnerUser, UserJourneyRole.owner),
            createMockUserJourney(mockGuestUser, UserJourneyRole.editor)
          ]
        }
      }

      const result = useAccessDialogData(
        dataWithOwnerInTeam,
        undefined,
        mockGuestUser.email
      )

      // Should return original team data unchanged
      expect(result.enhancedTeamData?.userTeams).toHaveLength(2)
      expect(result.enhancedTeamData?.userTeams[0].user.email).toBe(
        mockOwnerUser.email
      )
      expect(result.enhancedTeamData?.userTeams[1].user.email).toBe(
        mockTeamMemberUser.email
      )
    })
  })

  describe('user categorization', () => {
    const mockData: GetJourneyWithPermissions = {
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        team: {
          __typename: 'Team',
          id: 'team-id',
          userTeams: [
            createMockUserTeam(mockTeamMemberUser, UserTeamRole.member)
          ]
        },
        userJourneys: [
          createMockUserJourney(mockOwnerUser, UserJourneyRole.owner),
          createMockUserJourney(mockGuestUser, UserJourneyRole.editor),
          createMockUserJourney(
            {
              ...mockGuestUser,
              id: 'request-user',
              email: 'request@example.com'
            },
            UserJourneyRole.inviteRequested
          )
        ]
      }
    }

    it('should categorize users correctly', () => {
      const result = useAccessDialogData(
        mockData,
        undefined,
        'other@example.com'
      )

      // Owner should not be in guests (excluded by role)
      // Team member should not be in guests (excluded by team membership)
      expect(result.guestUsers).toHaveLength(1)
      expect(result.guestUsers[0].user?.email).toBe(mockGuestUser.email)

      // Should have pending requests
      expect(result.pendingRequests).toHaveLength(1)
      expect(result.pendingRequests[0].role).toBe(
        UserJourneyRole.inviteRequested
      )
    })
  })

  describe('email collection', () => {
    const mockUserInviteData = {
      userInvites: [
        createMockInvite('pending@example.com', false, false),
        createMockInvite('accepted@example.com', true, false),
        createMockInvite('removed@example.com', false, true)
      ]
    }

    const mockData: GetJourneyWithPermissions = {
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        team: null,
        userJourneys: [
          createMockUserJourney(mockOwnerUser, UserJourneyRole.owner),
          createMockUserJourney(mockGuestUser, UserJourneyRole.editor)
        ]
      }
    }

    it('should collect all emails from user journeys and pending invites', () => {
      const result = useAccessDialogData(
        mockData,
        mockUserInviteData,
        undefined
      )

      expect(result.allEmails).toContain(mockOwnerUser.email)
      expect(result.allEmails).toContain(mockGuestUser.email)
      expect(result.allEmails).toContain('pending@example.com') // Only pending invites
      expect(result.allEmails).not.toContain('accepted@example.com')
      expect(result.allEmails).not.toContain('removed@example.com')
    })

    it('should filter pending invites correctly', () => {
      const result = useAccessDialogData(
        mockData,
        mockUserInviteData,
        undefined
      )

      expect(result.pendingInvites).toHaveLength(1)
      expect(result.pendingInvites[0].email).toBe('pending@example.com')
    })
  })

  describe('current user identification', () => {
    const mockData: GetJourneyWithPermissions = {
      journey: {
        __typename: 'Journey',
        id: 'journey-id',
        team: {
          __typename: 'Team',
          id: 'team-id',
          userTeams: [
            createMockUserTeam(mockTeamMemberUser, UserTeamRole.member)
          ]
        },
        userJourneys: [
          createMockUserJourney(mockOwnerUser, UserJourneyRole.owner)
        ]
      }
    }

    it('should identify current user in both journey and team contexts', () => {
      const result = useAccessDialogData(
        mockData,
        undefined,
        mockTeamMemberUser.email
      )

      expect(result.currentUserJourney).toBeUndefined() // Not in journey access
      expect(result.currentUserTeam?.user.email).toBe(mockTeamMemberUser.email)
    })

    it('should handle undefined current user email', () => {
      const result = useAccessDialogData(mockData, undefined, undefined)

      expect(result.currentUserJourney).toBeUndefined()
      expect(result.currentUserTeam).toBeUndefined()
    })
  })
})
