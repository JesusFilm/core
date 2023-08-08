import { OperationVariables, QueryResult, gql, useQuery } from '@apollo/client'
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useState
} from 'react'

import {
  GetLastActiveTeamIdAndTeams,
  GetLastActiveTeamIdAndTeams_teams as Team
} from '../../../../__generated__/GetLastActiveTeamIdAndTeams'

interface Context {
  query: QueryResult<GetLastActiveTeamIdAndTeams, OperationVariables>
  activeTeam: Team | null
  setActiveTeam: (team: Team | null) => void
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
      lastActiveTeamId
    }
    teams {
      id
      title
    }
  }
`

export function TeamProvider({ children }: TeamProviderProps): ReactElement {
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const query = useQuery<GetLastActiveTeamIdAndTeams>(
    GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
    {
      onCompleted: (data) => {
        if (activeTeam != null || data.teams == null) return
        const lastActiveTeam = data.teams.find(
          (team) => team.id === data.getJourneyProfile?.lastActiveTeamId
        )
        setActiveTeam(lastActiveTeam ?? null)
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
    query.data?.teams.find((team) => team.id === activeTeamId) ?? null

  return (
    <TeamContext.Provider value={{ query, activeTeam, setActiveTeam }}>
      {children}
    </TeamContext.Provider>
  )
}
