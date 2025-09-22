import {
  JourneyStatus,
  Prisma,
  UserJourneyRole,
  UserTeamRole
} from '@core/prisma/journeys/client'
import { User as BaseUser } from '@core/yoga/firebaseClient'
import { DefaultArgs } from '@prisma/client/runtime/library'

import { Action } from '../../lib/auth/ability'

export { Action } from '../../lib/auth/ability'

// Extend the User type to include roles
interface User extends BaseUser {
  roles?: string[]
}

export type Journey = Prisma.JourneyGetPayload<{
  include: {
    userJourneys: true
    team: {
      include: { userTeams: true }
    }
  }
}>

export const INCLUDE_JOURNEY_ACL: Prisma.BlockInclude<DefaultArgs> = {
  journey: {
    include: {
      team: { include: { userTeams: true } },
      userJourneys: true
    }
  }
}

export function journeyAcl(
  action: Action,
  journey: Partial<Journey>,
  user: User
): boolean {
  // Allow reading published templates
  if (
    action === Action.Read &&
    journey.template === true &&
    journey.status === JourneyStatus.published
  ) {
    return true
  }

  // Special publisher role permissions
  if (user.roles?.includes('publisher') === true) {
    // Publishers can create journeys for jfp-team
    if (action === Action.Create && journey.teamId === 'jfp-team') {
      return true
    }

    // Publishers can update any template
    if (action === Action.Update && journey.template === true) return true

    // Publishers can manage templates
    if (action === Action.Manage && journey.template === true) {
      return true
    }

    // Publishers can convert journey to template if they're owner/editor
    if (action === Action.Manage && 'template' in journey) {
      const userJourney = journey?.userJourneys?.find(
        (userJourney) => userJourney.userId === user.id
      )
      if (
        userJourney?.role === UserJourneyRole.owner ||
        userJourney?.role === UserJourneyRole.editor
      ) {
        return true
      }

      // Or if they're team manager/member
      const userTeam = journey?.team?.userTeams.find(
        (userTeam) => userTeam.userId === user.id
      )
      if (
        userTeam?.role === UserTeamRole.manager ||
        userTeam?.role === UserTeamRole.member
      ) {
        return true
      }
    }
  }

  // Non-publishers cannot manage templates
  if (action === Action.Manage && 'template' in journey) {
    return false
  }

  switch (action) {
    case Action.Create:
      return create(journey, user)
    case Action.Read:
      return read(journey, user)
    case Action.Update:
      return update(journey, user)
    case Action.Delete:
      return manage(journey, user)
    case Action.Manage:
      return manage(journey, user)
    default:
      return false
  }
}

// team managers and journeys owners can manage the journey
function manage(journey: Partial<Journey>, user: User): boolean {
  const userJourney = journey?.userJourneys?.find(
    (userJourney) => userJourney.userId === user.id
  )

  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  const isUserRoleOwner = userJourney?.role === UserJourneyRole.owner

  const isTeamManager = userTeam?.role === UserTeamRole.manager

  return isUserRoleOwner || isTeamManager
}

// team managers and team members can create a journey
function create(journey: Partial<Journey>, user: User): boolean {
  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  const isTeamManager = userTeam?.role === UserTeamRole.manager
  const isTeamMember = userTeam?.role === UserTeamRole.member

  return isTeamManager || isTeamMember
}

// team managers/members and journeys owners/editors can read the journey
function read(journey: Partial<Journey>, user: User): boolean {
  const userJourney = journey?.userJourneys?.find(
    (userJourney) => userJourney.userId === user.id
  )

  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  return userTeam != null || userJourney != null
}

// team managers/members and journeys owners/editors can update the journey
function update(journey: Partial<Journey>, user: User): boolean {
  const userJourney = journey?.userJourneys?.find(
    (userJourney) => userJourney.userId === user.id
  )
  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )
  const hasJourneyUpdateAccess =
    userJourney?.role === UserJourneyRole.owner ||
    userJourney?.role === UserJourneyRole.editor
  const hasTeamUpdateAccess =
    userTeam?.role === UserTeamRole.manager ||
    userTeam?.role === UserTeamRole.member
  return hasJourneyUpdateAccess || hasTeamUpdateAccess
}
