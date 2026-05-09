import type { ActiveSession } from '../../auth/login'
import { graphqlRequest } from '../../graphql/client'

export interface Team {
  id: string
  title: string
  publicTitle: string | null
}

export interface TeamsAndActiveTeam {
  teams: Team[]
  /**
   * The last active team id stored on the user's JourneyProfile, mirroring
   * the value journeys-admin reads. `null` is a meaningful selection — the
   * user has explicitly chosen "Shared with me" (or has never picked).
   */
  lastActiveTeamId: string | null
}

const TEAMS_AND_PROFILE_QUERY = /* GraphQL */ `
  query ScribeTeamsAndProfile {
    teams {
      id
      title
      publicTitle
    }
    getJourneyProfile {
      id
      lastActiveTeamId
    }
  }
`

interface TeamsAndProfileData {
  teams: Team[]
  getJourneyProfile: { id: string; lastActiveTeamId: string | null } | null
}

export async function fetchTeamsAndActiveTeam(
  session: ActiveSession
): Promise<TeamsAndActiveTeam> {
  const data = await graphqlRequest<TeamsAndProfileData>(session, {
    query: TEAMS_AND_PROFILE_QUERY,
    operationName: 'ScribeTeamsAndProfile'
  })
  return {
    teams: data.teams,
    lastActiveTeamId: data.getJourneyProfile?.lastActiveTeamId ?? null
  }
}

const UPDATE_LAST_ACTIVE_TEAM_ID = /* GraphQL */ `
  mutation ScribeUpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`

export async function persistLastActiveTeamId(
  session: ActiveSession,
  lastActiveTeamId: string | null
): Promise<void> {
  await graphqlRequest(session, {
    query: UPDATE_LAST_ACTIVE_TEAM_ID,
    variables: { input: { lastActiveTeamId } },
    operationName: 'ScribeUpdateLastActiveTeamId'
  })
}
