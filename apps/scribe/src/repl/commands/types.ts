import type { ActiveSession } from '../../auth/login'
import type { EnvironmentId } from '../../config/environments'

export interface CommandContext {
  session: ActiveSession
  appendSystemMessage: (text: string, tone?: 'info' | 'warn' | 'error') => void
  setSession: (session: ActiveSession) => void
  switchEnvironment: (envId: EnvironmentId) => Promise<void>
  forceLogin: () => Promise<void>
  clearTranscript: () => void
  exit: () => void
}

export interface SlashCommand {
  name: string
  /** Optional inline argument hint shown in the popup. */
  argHint?: string
  description: string
  run: (args: string[], context: CommandContext) => Promise<void> | void
}
