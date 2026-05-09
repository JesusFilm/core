import type { ActiveSession } from '../../auth/login'

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
}
