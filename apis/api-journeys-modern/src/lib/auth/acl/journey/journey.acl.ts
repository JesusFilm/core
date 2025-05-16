import { Prisma } from '.prisma/api-journeys-client'
import { User } from '@core/yoga/firebaseClient'

import { Action } from '../../ability'

export type Journey = Prisma.JourneyGetPayload<{
  include: {
    userJourneys: true
    team: {
      include: { userTeams: true }
    }
  }
}>

export function journeyAcl(
  action: Action,
  journey: Journey,
  user: User
): boolean {
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
  }
}

// team managers and journeys owners can manage the journey
function manage(journey: Journey, user: User): boolean {
  const userJourney = journey?.userJourneys.find(
    (userJourney) => userJourney.userId === user.id
  )

  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  const isUserRoleOwnerOrEditor = userJourney?.role === 'owner'

  const isTeamOwner = userTeam?.role === 'manager'

  return isUserRoleOwnerOrEditor || isTeamOwner
}

// team managers and team members can create a journey
function create(journey: Journey, user: User): boolean {
  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  const isTeamManager = userTeam?.role === 'manager'
  const isTeamMember = userTeam?.role === 'member'

  return isTeamManager || isTeamMember
}

// team manaers/owners and journeys owners/editors can read the journey
function read(journey: Journey, user: User): boolean {
  const userJourney = journey?.userJourneys.find(
    (userJourney) => userJourney.userId === user.id
  )

  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  return userTeam != null || userJourney != null
}

// team manaers/owners and journeys owners/editors can read the journey
function update(journey: Journey, user: User): boolean {
  return read(journey, user)
}
