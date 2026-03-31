import {
  OperationVariables,
  QueryResult,
  gql,
  useApolloClient,
  useMutation,
  useQuery
} from '@apollo/client'
import { sendGTMEvent } from '@next/third-parties/google'
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useRef,
  useState
} from 'react'

import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../libs/useUpdateLastActiveTeamIdMutation'

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

const SESSION_STORAGE_KEY = 'journeys-admin:activeTeamId'
const SHARED_WITH_ME_SENTINEL = '__shared__'

function getSessionTeamId(): string | null | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (stored == null) return undefined
    if (stored === SHARED_WITH_ME_SENTINEL) return null
    return stored
  } catch (error) {
    console.error('Failed to read activeTeamId from sessionStorage:', error)
    return undefined
  }
}

function setSessionTeamId(teamId: string | null): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      teamId ?? SHARED_WITH_ME_SENTINEL
    )
  } catch (error) {
    console.error('Failed to write activeTeamId to sessionStorage:', error)
  }
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
          ... on AuthenticatedUser {
            id
            firstName
            lastName
            imageUrl
            email
          }
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
  const client = useApolloClient()
  const [updateLastActiveTeamId] = useMutation(UPDATE_LAST_ACTIVE_TEAM_ID)
  // Capture the session value at mount time (before setActiveTeam writes to it)
  const initialSessionTeamId = useRef(getSessionTeamId())

  function syncDbAndRefetch(resolvedTeamId: string | null): void {
    void updateLastActiveTeamId({
      variables: {
        input: { lastActiveTeamId: resolvedTeamId }
      },
      onCompleted() {
        void client.refetchQueries({ include: ['GetAdminJourneys'] })
      }
    })
  }

  function updateActiveTeam(data: GetLastActiveTeamIdAndTeams): void {
    if (activeTeam !== undefined || data.teams == null) return
    sendGTMEvent({
      event: 'get_teams',
      teams: data.teams.length
    })

    const sessionTeamId = initialSessionTeamId.current
    const dbTeamId = data.getJourneyProfile?.lastActiveTeamId ?? null

    if (sessionTeamId !== undefined) {
      // Per-tab session value exists from a previous page load — use it instead of DB value
      if (sessionTeamId === null) {
        setActiveTeam(null)
        if (dbTeamId !== null) {
          syncDbAndRefetch(null)
        }
        return
      }
      const sessionTeam = data.teams.find((team) => team.id === sessionTeamId)
      if (sessionTeam != null) {
        setActiveTeam(sessionTeam)
        if (sessionTeamId !== dbTeamId) {
          syncDbAndRefetch(sessionTeamId)
        }
        return
      }
      // Session team not found in teams list (deleted/inaccessible) — fall through to DB
    }

    const lastActiveTeam = data.teams.find((team) => team.id === dbTeamId)
    if (lastActiveTeam != null) {
      setActiveTeam(lastActiveTeam)
      return
    }

    // Deterministic onboarding recovery:
    // when DB lastActiveTeamId is null but exactly one team exists, that team is
    // the intended active team for first-time users. Persist it back to the DB.
    if (dbTeamId == null && data.teams.length === 1) {
      setActiveTeam(data.teams[0])
      syncDbAndRefetch(data.teams[0].id)
      return
    }

    setActiveTeam(null)
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
    setSessionTeamId(team?.id ?? null)
    if (team == null) {
      setActiveTeamId(null)
    } else {
      setActiveTeamId(team.id)
    }
  }

  const activeTeam =
    activeTeamId != null
      ? (query.data?.teams.find((team) => team.id === activeTeamId) ?? null)
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
