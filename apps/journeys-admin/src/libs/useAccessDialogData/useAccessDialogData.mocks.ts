
import {
    GetJourneyWithPermissions_journey_userJourneys as UserJourney,
    GetJourneyWithPermissions_journey_team_userTeams as UserTeam
  } from '../../../__generated__/GetJourneyWithPermissions'
import { UserJourneyRole, UserTeamRole } from '../../../__generated__/globalTypes'

export const mockOwnerUser = {
    __typename: 'User' as const,
    id: 'owner-user-id',
    firstName: 'Journey',
    lastName: 'Owner',
    email: 'owner@example.com',
    imageUrl: 'https://example.com/owner.jpg'
  }
  
  export const mockGuestUser = {
    __typename: 'User' as const,
    id: 'guest-user-id', 
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@example.com',
    imageUrl: 'https://example.com/guest.jpg'
  }
  
  export const mockTeamMemberUser = {
    __typename: 'User' as const,
    id: 'team-member-id',
    firstName: 'Team',
    lastName: 'Member', 
    email: 'team@example.com',
    imageUrl: 'https://example.com/team.jpg'
  }
  
  const mockJourneyNotification = {
    __typename: 'JourneyNotification' as const,
    id: 'notification-id',
    visitorInteractionEmail: true
  }
  
  export const createMockUserJourney = (user: any, role: UserJourneyRole): UserJourney => ({
    __typename: 'UserJourney',
    id: `user-journey-${user.id}`,
    role,
    user,
    journeyNotification: mockJourneyNotification
  })
  
  export const createMockUserTeam = (user: any, role: UserTeamRole): UserTeam => ({
    __typename: 'UserTeam',
    id: `user-team-${user.id}`,
    role,
    user,
    journeyNotification: mockJourneyNotification
  })
  
  export const createMockInvite = (email: string, accepted = false, removed = false) => ({
    id: `invite-${email}`,
    email,
    acceptedAt: accepted ? new Date().toISOString() : null,
    removedAt: removed ? new Date().toISOString() : null
  })