import {
    GetJourneyWithPermissions,
    GetJourneyWithPermissions_journey_userJourneys as UserJourney,
    GetJourneyWithPermissions_journey_team_userTeams as UserTeam,
    GetJourneyWithPermissions_journey_team as JourneyTeam
  } from '../../../__generated__/GetJourneyWithPermissions'
import { UserJourneyRole, UserTeamRole } from '../../../__generated__/globalTypes'

export function useAccessDialogData(data: GetJourneyWithPermissions | undefined, userInviteData: any, currentUserEmail?: string) {
    const userJourneys = data?.journey?.userJourneys ?? []
    const teamMembers = data?.journey?.team?.userTeams ?? []
    const invites = userInviteData?.userInvites ?? []
  
    // Find current user's access levels
    const currentUserJourney = findCurrentUserJourney(userJourneys, currentUserEmail)
    const currentUserTeam = findCurrentUserTeam(teamMembers, currentUserEmail)
  
    // Process team data with owner inclusion
    const enhancedTeamData = createEnhancedTeamData(data, userJourneys, teamMembers)
  
    // Categorize users
    const { guestUsers, pendingRequests } = categorizeUserJourneys(userJourneys, teamMembers)
    
    // Process invites
    const pendingInvites = filterPendingInvites(invites)
    
    // Collect all emails
    const allEmails = collectAllEmails(userJourneys, pendingInvites)
  
    return {
      currentUserJourney,
      currentUserTeam,
      enhancedTeamData,
      guestUsers,
      pendingRequests,
      pendingInvites,
      allEmails
    }
  }
  
  function findCurrentUserJourney(userJourneys: UserJourney[], currentUserEmail?: string): UserJourney | undefined {
    if (!currentUserEmail) return undefined
    return userJourneys.find(uj => uj.user?.email === currentUserEmail)
  }
  
  function findCurrentUserTeam(teamMembers: UserTeam[], currentUserEmail?: string): UserTeam | undefined {
    if (!currentUserEmail) return undefined
    return teamMembers.find(tm => tm.user.email === currentUserEmail)
  }
  
  function findJourneyOwner(userJourneys: UserJourney[]): UserJourney | undefined {
    return userJourneys.find(uj => uj.role === UserJourneyRole.owner)
  }
  
  function isOwnerAlreadyInTeam(journeyOwner: UserJourney | undefined, teamMembers: UserTeam[]): boolean {
    if (!journeyOwner?.user) return false
    return teamMembers.some(tm => tm.user.id === journeyOwner.user!.id)
  }
  
  function createSyntheticOwnerTeamMember(journeyOwner: UserJourney): UserTeam {
    return {
      __typename: "UserTeam",
      id: `synthetic-owner-${journeyOwner.id}`,
      role: UserTeamRole.manager,
      user: journeyOwner.user!,
      journeyNotification: journeyOwner.journeyNotification
    }
  }
  
  function createEnhancedTeamData(data: GetJourneyWithPermissions | undefined, userJourneys: UserJourney[], teamMembers: UserTeam[]): JourneyTeam | undefined {
    const journeyOwner = findJourneyOwner(userJourneys)
    
    if (!journeyOwner?.user || isOwnerAlreadyInTeam(journeyOwner, teamMembers)) {
      return data?.journey?.team ?? undefined
    }
  
    const syntheticOwner = createSyntheticOwnerTeamMember(journeyOwner)
  
    if (!data?.journey?.team) {
      return {
        __typename: "Team" as const,
        id: `synthetic-team-${data?.journey?.id ?? 'unknown'}`,
        userTeams: [syntheticOwner]
      } as JourneyTeam
    }

    return {
      ...data.journey.team,
      userTeams: [syntheticOwner, ...teamMembers]
    } as JourneyTeam
  }
  
  function categorizeUserJourneys(userJourneys: UserJourney[], teamMembers: UserTeam[]) {
    const guestUsers: UserJourney[] = []
    const pendingRequests: UserJourney[] = []
  
    userJourneys.forEach(uj => {
      if (uj.role === UserJourneyRole.inviteRequested) {
        pendingRequests.push(uj)
      } else if (uj.role !== UserJourneyRole.owner && !isUserInTeam(uj, teamMembers)) {
        guestUsers.push(uj)
      }
    })
  
    return { guestUsers, pendingRequests }
  }
  
  function isUserInTeam(userJourney: UserJourney, teamMembers: UserTeam[]): boolean {
    return teamMembers.some(tm => tm.user.id === userJourney.user?.id)
  }
  
  function filterPendingInvites(invites: any[]) {
    return invites.filter(invite => !invite.removedAt && !invite.acceptedAt)
  }
  
  function collectAllEmails(userJourneys: UserJourney[], pendingInvites: any[]): string[] {
    const emails: string[] = []
    
    userJourneys.forEach(uj => {
      if (uj.user?.email) {
        emails.push(uj.user.email)
      }
    })
    
    pendingInvites.forEach(invite => {
      emails.push(invite.email)
    })
    
    return emails
  }