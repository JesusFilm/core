import { graphql } from 'gql.tada'

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

const TEAMS_AND_PROFILE_QUERY = graphql(`
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
`)

export async function fetchTeamsAndActiveTeam(
  session: ActiveSession
): Promise<TeamsAndActiveTeam> {
  const data = await graphqlRequest(session, TEAMS_AND_PROFILE_QUERY)
  return {
    teams: data.teams,
    lastActiveTeamId: data.getJourneyProfile?.lastActiveTeamId ?? null
  }
}

const UPDATE_LAST_ACTIVE_TEAM_ID = graphql(`
  mutation ScribeUpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`)

export async function persistLastActiveTeamId(
  session: ActiveSession,
  lastActiveTeamId: string | null
): Promise<void> {
  await graphqlRequest(session, UPDATE_LAST_ACTIVE_TEAM_ID, {
    input: { lastActiveTeamId }
  })
}
