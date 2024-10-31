import {
  Prisma,
  Team,
  UserJourneyRole,
  UserTeamRole
} from '.prisma/api-journeys-modern-client'

import { User } from '../../firebaseClient'

type OmittedUser = Omit<User, 'id' | 'emailVerified'>

export type ApiJourneysJob =
  | JourneyEditInviteJob
  | TeamInviteJob
  | JourneyRequestApproved
  | JourneyAccessRequest
  | TeamInviteAccepted
  | TeamRemoved

export interface JourneyAccessRequest {
  journey: JourneyWithTeamAndUserJourney
  url: string
  sender: OmittedUser
}

export interface JourneyEditInviteJob {
  email: string
  journey: JourneyWithTeamAndUserJourney
  url: string
  sender: OmittedUser
}

export interface JourneyRequestApproved {
  userId: string
  journey: JourneyWithTeamAndUserJourney
  url: string
  sender: OmittedUser
}

export type JourneyWithTeamAndUserJourney = Prisma.JourneyGetPayload<{
  include: {
    userJourneys: true
    team: true
    primaryImageBlock: true
  }
}>

export interface TeamInviteAccepted {
  team: TeamWithUserTeam
  sender: OmittedUser
}

export interface TeamInviteJob {
  team: Team
  email: string
  sender: OmittedUser
}

export interface TeamRemoved {
  teamName: string
  userId: string
}

export type TeamWithUserTeam = Prisma.TeamGetPayload<{
  include: {
    userTeams: true
  }
}>

export interface VerifyUserJob {
  userId: string
  email: string
  token: string
  redirect: string | undefined
}
