import type { ActiveSession } from '../../auth/login'
import type { JourneyListItem } from '../../tools/journey/api'
import type { JourneySimpleCard } from '../../tools/journey/types'
import type { Team } from '../../tools/team/api'
import type { MeUser } from '../../tools/user/api'

/**
 * Returns the session that should be used for any GraphQL request — either
 * the operator's session or, while impersonating, an override carrying the
 * impersonated user's identity and token. Environment is preserved either
 * way so the gateway URL doesn't change.
 */
export function getEffectiveSession(state: ReplState): ActiveSession {
  if (state.impersonating == null) return state.session
  return {
    environment: state.session.environment,
    token: state.impersonating.token,
    email: state.impersonating.email,
    userId: state.impersonating.userId
  }
}

export interface ImpersonationSession {
  /** Email of the impersonated user. */
  email: string
  /** Firebase user id (uid) of the impersonated user. */
  userId: string
  /** Active Firebase ID token authenticated as the impersonated user. */
  token: string
  /** ISO timestamp the impersonation started, for display. */
  startedAt: string
  /**
   * Epoch ms when the impersonation ID token expires. Firebase ID tokens are
   * good for ~1 hour from issue. Past this point the agent's API calls will
   * start failing with UNAUTHENTICATED — the user is expected to
   * /stop-impersonate (and re-impersonate if needed). No automatic refresh.
   */
  expiresAt: number
}

export type TeamSelection =
  | { kind: 'team'; team: Team }
  | { kind: 'shared' }

export type TeamsLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; teams: Team[] }
  | { status: 'error'; message: string }

export type JourneysLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; journeys: JourneyListItem[] }
  | { status: 'error'; message: string }

export type CardsLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; cards: JourneySimpleCard[] }
  | { status: 'error'; message: string }

/**
 * One of the content fields that can live on a JourneySimple card. These are
 * the things journeys-admin calls "blocks" at the GraphQL level (Typography,
 * Button, RadioOption, Image, Video). Stored as a kind string so picker UX
 * and the system prompt can talk about them uniformly.
 */
export type BlockKind =
  | 'heading'
  | 'text'
  | 'button'
  | 'poll'
  | 'image'
  | 'backgroundImage'
  | 'video'

export interface UsageTotals {
  inputTokens: number
  outputTokens: number
  cacheCreationInputTokens: number
  cacheReadInputTokens: number
  turns: number
}

export type TranscriptEntry =
  | {
      kind: 'user'
      id: string
      text: string
    }
  | {
      kind: 'assistant'
      id: string
      text: string
    }
  | {
      kind: 'tool_call'
      id: string
      name: string
      input: unknown
    }
  | {
      kind: 'system'
      id: string
      text: string
      tone?: 'info' | 'warn' | 'error'
    }

export interface ReplState {
  session: ActiveSession
  /**
   * Model alias (e.g. 'opus', 'sonnet', 'haiku') or full model ID passed
   * through to the Claude Agent SDK. `null` means "use the SDK default" —
   * the same behaviour as omitting `--model` at startup.
   */
  model: string | null
  transcript: TranscriptEntry[]
  usage: UsageTotals
  status: 'idle' | 'thinking' | 'tool'
  /** Name of the MCP tool currently executing. Set when status === 'tool'. */
  currentToolName: string | null
  /** Epoch ms timestamp when the current activity (thinking/tool) began. */
  activityStartedAt: number | null
  /** Bumped whenever the agent loop should be torn down and rebuilt. */
  agentEpoch: number
  teams: TeamsLoadState
  /**
   * `null` until teams have loaded the first time. After that, `kind: 'team'`
   * for a real team or `kind: 'shared'` for the "Shared with me" pseudo-team.
   */
  activeTeam: TeamSelection | null
  teamPickerOpen: boolean
  journeys: JourneysLoadState
  activeJourney: JourneyListItem | null
  journeyPickerOpen: boolean
  /**
   * Cards inside the active journey. `idle` whenever no journey is selected;
   * fetched via fetchJourneySimple after a journey becomes active.
   */
  cards: CardsLoadState
  activeCard: JourneySimpleCard | null
  cardPickerOpen: boolean
  /**
   * Which content field of the active card the user is focused on. Always
   * `null` whenever no card is active; reset whenever the active card or
   * its underlying journey changes.
   */
  activeBlock: BlockKind | null
  blockPickerOpen: boolean
  modelPickerOpen: boolean
  /**
   * Profile of the operator who actually signed in (never the impersonated
   * user). Loaded once after login. `null` while loading; the `me` field
   * stays the operator even mid-impersonation, so /impersonate availability
   * is decided against the real user.
   */
  me: MeUser | null
  /** Set while an impersonation is active. `null` when running as the operator. */
  impersonating: ImpersonationSession | null
}
