import { useQuery, gql, QueryResult, OperationVariables } from '@apollo/client'
import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useContext,
  useState
} from 'react'
import {
  GetTeams,
  GetTeams_teams as Team
} from '../../../../__generated__/GetTeams'

interface Context {
  query: QueryResult<GetTeams, OperationVariables>
  activeTeam: Team | null
  setActiveTeam: Dispatch<SetStateAction<Team | null>>
}

const TeamContext = createContext<Context>({} as unknown as Context)

export function useTeam(): Context {
  const context = useContext(TeamContext)

  return context
}

interface TeamProviderProps {
  children: ReactNode
}

export const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
      title
    }
  }
`

export function TeamProvider({ children }: TeamProviderProps): ReactElement {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null)
  const query = useQuery<GetTeams>(GET_TEAMS, {
    onCompleted: (data) => {
      if (data.teams != null && activeTeam == null) setActiveTeam(data.teams[0])
    }
  })

  return (
    <TeamContext.Provider value={{ query, activeTeam, setActiveTeam }}>
      {children}
    </TeamContext.Provider>
  )
}
