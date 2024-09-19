import { OperationVariables, QueryResult, gql, useQuery } from '@apollo/client'
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useState
} from 'react'
import TagManager from 'react-gtm-module'

import {
  GetLastActiveTeamIdAndTeams,
  GetLastActiveTeamIdAndTeams_teams as Team
} from './__generated__/GetLastActiveTeamIdAndTeams'

interface Context {
  query: QueryResult<GetLastActiveTeamIdAndTeams, OperationVariables>
  /** activeTeam is null if loaded and set intentionally */
  activeTeam: Team | null | undefined
  setActiveTeam: (team: Team | null) => void
  refetch: () => Promise<void>
}

const TeamContext = createContext<Context>({} as unknown as Context)

export function useTeam(): Context {
  const context = useContext(TeamContext)

  return context
}

interface TeamProviderProps {
  children: ReactNode
}

export const GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS = gql`
  query GetLastActiveTeamIdAndTeams {
    getJourneyProfile {
      id
      lastActiveTeamId
    }
    teams {
      id
      title
      publicTitle
      userTeams {
        id
        user {
          id
          firstName
          lastName
          imageUrl
          email
        }
        role
      }
      customDomains {
        id
        name
      }
    }
  }
`

export function TeamProvider({ children }: TeamProviderProps): ReactElement {
  const [activeTeamId, setActiveTeamId] = useState<string | null | undefined>(
    undefined
  )

  function updateActiveTeam(data: GetLastActiveTeamIdAndTeams): void {
    if (activeTeam != null || data.teams == null) return
    TagManager.dataLayer({
      dataLayer: {
        event: 'get_teams',
        teams: data.teams.length
      }
    })
    const lastActiveTeam = data.teams.find(
      (team) => team.id === data.getJourneyProfile?.lastActiveTeamId
    )
    setActiveTeam(lastActiveTeam ?? null)
  }

  const query = useQuery<GetLastActiveTeamIdAndTeams>(
    GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
    {
      onCompleted: (data) => {
        updateActiveTeam(data)
      }
    }
  )

  function setActiveTeam(team: Team | null): void {
    if (team == null) {
      setActiveTeamId(null)
    } else {
      setActiveTeamId(team.id)
    }
  }

  const activeTeam =
    activeTeamId != null
      ? query.data?.teams.find((team) => team.id === activeTeamId) ?? null
      : activeTeamId

  // query.refetch() does not rerun onCompleted
  // https://github.com/apollographql/apollo-client/issues/11151
  async function refetch(): Promise<void> {
    const { data } = await query.refetch()
    updateActiveTeam(data)
  }

  return (
    <TeamContext.Provider value={{ query, activeTeam, setActiveTeam, refetch }}>
      {children}
    </TeamContext.Provider>
  )
}
