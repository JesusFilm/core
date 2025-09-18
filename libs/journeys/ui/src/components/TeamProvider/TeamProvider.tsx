import {
  OperationVariables,
  QueryResult,
  gql,
  useLazyQuery,
  LazyQueryResultTuple,
  LazyQueryExecFunction
} from '@apollo/client'
import { sendGTMEvent } from '@next/third-parties/google'
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
} from './__generated__/GetLastActiveTeamIdAndTeams'
import { useUser } from 'next-firebase-auth'

interface Context {
  // query: LazyQueryResultTuple<GetLastActiveTeamIdAndTeams, OperationVariables>
  /** activeTeam is null if loaded and set intentionally */
  activeTeam: Team | null | undefined
  setActiveTeam: (team: Team | null) => void
  getLastActiveTeamIdAndTeams: LazyQueryExecFunction<
    GetLastActiveTeamIdAndTeams,
    OperationVariables
  >
  teams: Team[]
  teamsLoading: boolean
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
  // const user = useUser()

  function updateActiveTeam(data: GetLastActiveTeamIdAndTeams): void {
    if (activeTeam != null || data.teams == null) return
    sendGTMEvent({
      event: 'get_teams',
      teams: data.teams.length
    })
    const lastActiveTeam = data.teams.find(
      (team) => team.id === data.getJourneyProfile?.lastActiveTeamId
    )
    setActiveTeam(lastActiveTeam ?? null)
  }

  const [getLastActiveTeamIdAndTeams, { data, loading }] =
    useLazyQuery<GetLastActiveTeamIdAndTeams>(
      GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
      {
        onCompleted: (data) => {
          console.log('data in onCompleted', data)
          updateActiveTeam(data)
        },
        fetchPolicy: 'network-only'
        //skip: userId == null
        //skip: user.id == null
      }
    )

  function setActiveTeam(team: Team | null): void {
    console.log('team in setActiveTeam', team)
    if (team == null) {
      setActiveTeamId(null)
    } else {
      setActiveTeamId(team.id)
    }
  }

  const activeTeam =
    activeTeamId != null
      ? (data?.teams.find((team) => team.id === activeTeamId) ?? null)
      : activeTeamId
  console.log('activeTeam in provider', activeTeam)
  // query.refetch() does not rerun onCompleted
  // https://github.com/apollographql/apollo-client/issues/11151
  // async function refetch(): Promise<void> {
  //   const { data } = await query.refetch()

  //   console.log('data in refetch', data)
  //   console.log('query in refetch', query.data)
  //   updateActiveTeam(data)
  // }

  console.log('query gets called in team provider', data?.getJourneyProfile?.id)

  return (
    <TeamContext.Provider
      value={{
        activeTeam,
        setActiveTeam,
        getLastActiveTeamIdAndTeams,
        teams: data?.teams ?? [],
        teamsLoading: loading
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}
