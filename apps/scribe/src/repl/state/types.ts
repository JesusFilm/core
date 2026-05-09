import type { ActiveSession } from '../../auth/login'
import type { JourneyListItem } from '../../tools/journey/api'
import type { Team } from '../../tools/team/api'

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
  transcript: TranscriptEntry[]
  usage: UsageTotals
  status: 'idle' | 'thinking' | 'tool'
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
}
