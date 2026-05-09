import type { ActiveSession } from '../../auth/login'
import type { EnvironmentId } from '../../config/environments'
import type { JourneyListItem } from '../../tools/journey/api'
import type {
  JourneysLoadState,
  TeamSelection,
  TeamsLoadState
} from '../state/types'

export interface CommandContext {
  session: ActiveSession
  teams: TeamsLoadState
  activeTeam: TeamSelection | null
  journeys: JourneysLoadState
  activeJourney: JourneyListItem | null
  appendSystemMessage: (text: string, tone?: 'info' | 'warn' | 'error') => void
  setSession: (session: ActiveSession) => void
  switchEnvironment: (envId: EnvironmentId) => Promise<void>
  forceLogin: () => Promise<void>
  clearTranscript: () => void
  openTeamPicker: () => void
  setActiveTeam: (selection: TeamSelection) => void
  refreshTeams: () => void
  openJourneyPicker: () => void
  setActiveJourney: (journey: JourneyListItem) => void
  refreshJourneys: () => void
  exit: () => void
}

export interface SlashCommand {
  name: string
  /** Optional inline argument hint shown in the popup. */
  argHint?: string
  description: string
  run: (args: string[], context: CommandContext) => Promise<void> | void
}
