import type { ActiveSession } from '../../auth/login'
import type { EnvironmentId } from '../../config/environments'
import type { JourneyListItem } from '../../tools/journey/api'
import type { JourneySimpleCard } from '../../tools/journey/types'
import type { MeUser } from '../../tools/user/api'
import type {
  CardsLoadState,
  ImpersonationSession,
  JourneysLoadState,
  TeamSelection,
  TeamsLoadState
} from '../state/types'

export interface CommandContext {
  session: ActiveSession
  model: string | null
  teams: TeamsLoadState
  activeTeam: TeamSelection | null
  journeys: JourneysLoadState
  activeJourney: JourneyListItem | null
  cards: CardsLoadState
  activeCard: JourneySimpleCard | null
  me: MeUser | null
  impersonating: ImpersonationSession | null
  appendSystemMessage: (text: string, tone?: 'info' | 'warn' | 'error') => void
  /**
   * Submit a synthetic user prompt to the agent loop. Behaves as if the user
   * had typed `text` into the input — appends it to the transcript and
   * advances the agent. Used by commands that hand work off to the model.
   */
  submitPrompt: (text: string) => void
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
  openCardPicker: () => void
  setActiveCard: (card: JourneySimpleCard) => void
  refreshCards: () => void
  startImpersonation: (email: string) => Promise<void>
  stopImpersonation: () => void
  setModel: (model: string | null) => void
  openModelPicker: () => void
  exit: () => void
}

export interface SlashCommand {
  name: string
  /** Optional inline argument hint shown in the popup. */
  argHint?: string
  description: string
  /**
   * Optional gate that hides the command from the menu and rejects direct
   * invocation when it returns false. Use for role-gated commands like
   * /impersonate (superadmin only) or /stop-impersonate (only when active).
   */
  isAvailable?: (context: CommandContext) => boolean
  run: (args: string[], context: CommandContext) => Promise<void> | void
}
