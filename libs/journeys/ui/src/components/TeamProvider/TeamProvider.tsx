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
const URL_PARAM_KEY = 'activeTeam'

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

function getUrlTeamId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return (
      new URLSearchParams(window.location.search).get(URL_PARAM_KEY) ??
      undefined
    )
  } catch (error) {
    console.error('Failed to read activeTeam from URL:', error)
    return undefined
  }
}

function cleanUrlTeamParam(): void {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete(URL_PARAM_KEY)
    window.history.replaceState({}, '', url.toString())
  } catch (error) {
    console.error('Failed to clean activeTeam from URL:', error)
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
  // Capture the session and URL values at mount time (before setActiveTeam writes to them)
  const initialSessionTeamId = useRef(getSessionTeamId())
  const initialUrlTeamId = useRef(getUrlTeamId())

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

    // URL param takes highest priority (invitation links)
    const urlTeamId = initialUrlTeamId.current
    if (urlTeamId != null) {
      initialUrlTeamId.current = undefined
      cleanUrlTeamParam()
      const urlTeam = data.teams.find((team) => team.id === urlTeamId)
      if (urlTeam != null) {
        setActiveTeam(urlTeam)
        syncDbAndRefetch(urlTeamId)
        return
      }
      // URL team not found in teams list — fall through to session/DB
    }

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
