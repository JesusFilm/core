import { Box, Text, useApp } from 'ink'
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import {
  createProvider,
  getProviderMeta,
  isInstantiationError,
  isProviderReady
} from '../agents/registry'
import type { ActiveSession } from '../auth/login'
import { ensureSession } from '../auth/login'
import { clearCredential } from '../config/credentials'
import { type EnvironmentId, getEnvironment } from '../config/environments'
import {
  type ApiProviderId,
  type ProviderId,
  saveActiveProvider,
  saveProviderCredential
} from '../config/providers'
import { buildJourneyTools } from '../tools/journey'
import {
  type JourneyListItem,
  fetchJourneySimple,
  listJourneys
} from '../tools/journey/api'
import type { JourneySimpleCard } from '../tools/journey/types'
import {
  fetchTeamsAndActiveTeam,
  persistLastActiveTeamId
} from '../tools/team/api'
import {
  exchangeCustomTokenForIdToken,
  fetchMe,
  requestImpersonationCustomToken
} from '../tools/user/api'

import { findCommand } from './commands/registry'
import type { CommandContext } from './commands/types'
import { ActivityIndicator } from './components/ActivityIndicator'
import { BlockPicker } from './components/BlockPicker'
import { CardPicker } from './components/CardPicker'
import { Input, usePromptHistory } from './components/Input'
import { JourneyPicker } from './components/JourneyPicker'
import { ModelPicker } from './components/ModelPicker'
import {
  type ProviderCredentialInput,
  ProviderPicker
} from './components/ProviderPicker'
import { StatusBar } from './components/StatusBar'
import { TeamPicker, describeSelection } from './components/TeamPicker'
import { Transcript } from './components/Transcript'
import {
  type BlockKind,
  type ReplState,
  type TeamSelection,
  type TranscriptEntry,
  type UsageTotals,
  getEffectiveSession
} from './state/types'
import { buildSystemPrompt } from './systemPrompt'

const EMPTY_USAGE: UsageTotals = {
  inputTokens: 0,
  outputTokens: 0,
  cacheCreationInputTokens: 0,
  cacheReadInputTokens: 0,
  turns: 0
}

interface AppProps {
  initialSession: ActiveSession
  initialProvider: ProviderId
  model?: string
}

let entryIdSeq = 0
function nextEntryId(prefix: string): string {
  entryIdSeq += 1
  return `${prefix}-${entryIdSeq}`
}

export function App({
  initialSession,
  initialProvider,
  model
}: AppProps): ReactElement {
  const { exit } = useApp()
  // Owned at the App level so prompt history survives whenever the Input
  // unmounts (e.g. while a slash command opens a picker).
  const promptHistory = usePromptHistory()
  const [state, setState] = useState<ReplState>(() => ({
    session: initialSession,
    model: model ?? null,
    transcript: [
      {
        kind: 'system',
        id: nextEntryId('sys'),
        text: `Signed in to ${initialSession.environment.label}${
          initialSession.email != null ? ` as ${initialSession.email}` : ''
        }. Using ${getProviderMeta(initialProvider).label}. Type / for commands.`,
        tone: 'info'
      }
    ],
    usage: EMPTY_USAGE,
    status: 'idle',
    currentToolName: null,
    activityStartedAt: null,
    agentEpoch: 0,
    teams: { status: 'idle' },
    activeTeam: null,
    teamPickerOpen: false,
    journeys: { status: 'idle' },
    activeJourney: null,
    journeyPickerOpen: false,
    cards: { status: 'idle' },
    activeCard: null,
    cardPickerOpen: false,
    activeBlock: null,
    blockPickerOpen: false,
    modelPickerOpen: false,
    provider: initialProvider,
    providerPickerOpen: false,
    me: null,
    impersonating: null
  }))
  // Bumped to force a teams refetch (e.g. after a load error, or on /env switch).
  const [teamsEpoch, setTeamsEpoch] = useState(0)
  const [journeysEpoch, setJourneysEpoch] = useState(0)
  const [cardsEpoch, setCardsEpoch] = useState(0)

  const promptQueue = useRef<PromptQueue | null>(null)

  const appendEntry = useCallback((entry: TranscriptEntry) => {
    setState((prev) => ({
      ...prev,
      transcript: [...prev.transcript, entry]
    }))
  }, [])

  const appendSystemMessage = useCallback(
    (text: string, tone: 'info' | 'warn' | 'error' = 'info') => {
      appendEntry({ kind: 'system', id: nextEntryId('sys'), text, tone })
    },
    [appendEntry]
  )

  const beginThinking = useCallback(() => {
    setState((prev) =>
      prev.status === 'thinking'
        ? prev
        : {
            ...prev,
            status: 'thinking',
            currentToolName: null,
            activityStartedAt: prev.activityStartedAt ?? Date.now()
          }
    )
  }, [])

  const beginTool = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      status: 'tool',
      currentToolName: name,
      activityStartedAt: prev.activityStartedAt ?? Date.now()
    }))
  }, [])

  const endActivity = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'idle',
      currentToolName: null,
      activityStartedAt: null
    }))
  }, [])

  const replaceSession = useCallback((session: ActiveSession) => {
    setState((prev) => ({
      ...prev,
      session,
      usage: EMPTY_USAGE,
      transcript: [
        ...prev.transcript,
        {
          kind: 'system',
          id: nextEntryId('sys'),
          text: `Switched to ${session.environment.label}${
            session.email != null ? ` as ${session.email}` : ''
          }.`,
          tone: 'info'
        }
      ],
      agentEpoch: prev.agentEpoch + 1,
      // Teams are scoped per environment — drop the previous result and re-fetch.
      teams: { status: 'idle' },
      activeTeam: null,
      teamPickerOpen: false,
      journeys: { status: 'idle' },
      activeJourney: null,
      journeyPickerOpen: false,
      cards: { status: 'idle' },
      activeCard: null,
      cardPickerOpen: false,
      activeBlock: null,
      blockPickerOpen: false,
      modelPickerOpen: false
    }))
    setTeamsEpoch((n) => n + 1)
    setJourneysEpoch((n) => n + 1)
  }, [])

  const switchEnvironment = useCallback(
    async (envId: EnvironmentId) => {
      const env = getEnvironment(envId)
      try {
        const session = await ensureSession(env)
        replaceSession(session)
      } catch (error) {
        appendSystemMessage(
          `Could not sign in to ${env.label}: ${formatError(error)}`,
          'error'
        )
      }
    },
    [appendSystemMessage, replaceSession]
  )

  const forceLogin = useCallback(async () => {
    try {
      const env = state.session.environment
      clearCredential(env.id)
      const session = await ensureSession(env, { forceLogin: true })
      replaceSession(session)
    } catch (error) {
      appendSystemMessage(`Login failed: ${formatError(error)}`, 'error')
    }
  }, [state.session.environment, appendSystemMessage, replaceSession])

  const clearTranscript = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transcript: [
        {
          kind: 'system',
          id: nextEntryId('sys'),
          text: `Cleared. Still signed in to ${prev.session.environment.label}.`,
          tone: 'info'
        }
      ],
      usage: EMPTY_USAGE,
      agentEpoch: prev.agentEpoch + 1
    }))
  }, [])

  const openTeamPicker = useCallback(() => {
    setState((prev) => ({ ...prev, teamPickerOpen: true }))
  }, [])

  const closeTeamPicker = useCallback(() => {
    setState((prev) => ({ ...prev, teamPickerOpen: false }))
  }, [])

  const setActiveTeam = useCallback(
    (selection: TeamSelection) => {
      setState((prev) => ({
        ...prev,
        activeTeam: selection,
        teamPickerOpen: false,
        // Restart the agent loop so the new system prompt (with team context)
        // takes effect on the next turn.
        agentEpoch: prev.agentEpoch + 1
      }))
      appendSystemMessage(
        `Active team set to ${describeSelection(selection)}.`,
        'info'
      )
      // Persist to the same JourneyProfile.lastActiveTeamId journeys-admin
      // reads, so the selection survives across sessions and clients. Run
      // best-effort in the background — failures are surfaced as warnings,
      // not blockers.
      const persistedId = selection.kind === 'team' ? selection.team.id : null
      // Persist against whichever session is effective — if the operator is
      // impersonating, the lastActiveTeamId belongs to the impersonated user.
      const effective = getEffectiveSession(state)
      void persistLastActiveTeamId(effective, persistedId).catch(
        (error: unknown) => {
          const message =
            error instanceof Error ? error.message : String(error)
          appendSystemMessage(
            `Could not save team selection to your profile: ${message}`,
            'warn'
          )
        }
      )
    },
    [appendSystemMessage, state.session]
  )

  const refreshTeams = useCallback(() => {
    setState((prev) => ({ ...prev, teams: { status: 'idle' } }))
    setTeamsEpoch((n) => n + 1)
  }, [])

  const openJourneyPicker = useCallback(() => {
    setState((prev) => ({ ...prev, journeyPickerOpen: true }))
  }, [])

  const closeJourneyPicker = useCallback(() => {
    setState((prev) => ({ ...prev, journeyPickerOpen: false }))
  }, [])

  const setActiveJourney = useCallback(
    (journey: JourneyListItem) => {
      setState((prev) => ({
        ...prev,
        activeJourney: journey,
        journeyPickerOpen: false,
        // Cards are scoped to a journey — drop them so they refetch for the
        // new selection. Any previously selected card (and block within it)
        // is no longer valid.
        cards: { status: 'idle' },
        activeCard: null,
        activeBlock: null,
        // Restart the agent loop so the next turn sees the updated journey
        // context in the system prompt.
        agentEpoch: prev.agentEpoch + 1
      }))
      setCardsEpoch((n) => n + 1)
      appendSystemMessage(
        `Active journey set to "${journey.title}" (${journey.slug}).`,
        'info'
      )
    },
    [appendSystemMessage]
  )

  const refreshJourneys = useCallback(() => {
    setState((prev) => ({ ...prev, journeys: { status: 'idle' } }))
    setJourneysEpoch((n) => n + 1)
  }, [])

  const openCardPicker = useCallback(() => {
    setState((prev) => ({ ...prev, cardPickerOpen: true }))
  }, [])

  const closeCardPicker = useCallback(() => {
    setState((prev) => ({ ...prev, cardPickerOpen: false }))
  }, [])

  const setActiveCard = useCallback(
    (card: JourneySimpleCard) => {
      setState((prev) => ({
        ...prev,
        activeCard: card,
        cardPickerOpen: false,
        // Block selection is scoped to a card — drop any previous pick when
        // the card changes.
        activeBlock: null,
        // Restart the agent loop so the next turn sees the updated card
        // context in the system prompt.
        agentEpoch: prev.agentEpoch + 1
      }))
      appendSystemMessage(
        `Active card set to ${card.id}${card.heading != null ? ` — "${card.heading}"` : ''}.`,
        'info'
      )
    },
    [appendSystemMessage]
  )

  const openBlockPicker = useCallback(() => {
    setState((prev) => ({ ...prev, blockPickerOpen: true }))
  }, [])

  const closeBlockPicker = useCallback(() => {
    setState((prev) => ({ ...prev, blockPickerOpen: false }))
  }, [])

  const setActiveBlock = useCallback(
    (block: BlockKind) => {
      setState((prev) => ({
        ...prev,
        activeBlock: block,
        blockPickerOpen: false,
        agentEpoch: prev.agentEpoch + 1
      }))
      appendSystemMessage(`Active block set to ${block}.`, 'info')
    },
    [appendSystemMessage]
  )

  const refreshCards = useCallback(() => {
    setState((prev) => ({ ...prev, cards: { status: 'idle' } }))
    setCardsEpoch((n) => n + 1)
  }, [])

  const startImpersonation = useCallback(
    async (email: string) => {
      // Always run this against the operator's own session — the userImpersonate
      // mutation requires the caller to be a real superadmin, not an alias.
      const operatorSession = state.session
      try {
        appendSystemMessage(
          `Requesting impersonation token for ${email}…`,
          'info'
        )
        const customToken = await requestImpersonationCustomToken(
          operatorSession,
          email
        )
        const exchanged = await exchangeCustomTokenForIdToken(
          operatorSession,
          customToken
        )
        const expiresInSeconds = Number.parseInt(exchanged.expiresIn, 10)
        // Default to 60 minutes if Firebase returns something unparseable —
        // never preserve `NaN` as the expiry.
        const lifetimeMs =
          Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
            ? expiresInSeconds * 1000
            : 60 * 60 * 1000
        setState((prev) => ({
          ...prev,
          impersonating: {
            email,
            userId: exchanged.localId,
            token: exchanged.idToken,
            startedAt: new Date().toISOString(),
            expiresAt: Date.now() + lifetimeMs
          },
          // Restart the agent loop so the new system prompt + effective
          // session propagate. Reset team and journey state so they refetch
          // for the impersonated user.
          agentEpoch: prev.agentEpoch + 1,
          teams: { status: 'idle' },
          activeTeam: null,
          journeys: { status: 'idle' },
          activeJourney: null,
          cards: { status: 'idle' },
          activeCard: null,
          activeBlock: null
        }))
        setTeamsEpoch((n) => n + 1)
        setJourneysEpoch((n) => n + 1)
        appendSystemMessage(
          `Impersonating ${email}. Run /stop-impersonate to return to your own session.`,
          'warn'
        )
      } catch (error) {
        appendSystemMessage(
          `Could not impersonate ${email}: ${formatError(error)}`,
          'error'
        )
      }
    },
    [state.session, appendSystemMessage]
  )

  const setModel = useCallback(
    (next: string | null) => {
      let changed = false
      setState((prev) => {
        if (prev.model === next) {
          // Still close the picker if it's open.
          return prev.modelPickerOpen
            ? { ...prev, modelPickerOpen: false }
            : prev
        }
        changed = true
        return {
          ...prev,
          model: next,
          modelPickerOpen: false,
          // Restart the agent loop so the new model takes effect on the next
          // turn. Token usage stays — it's already a running tally.
          agentEpoch: prev.agentEpoch + 1
        }
      })
      if (!changed) return
      appendSystemMessage(
        next == null
          ? 'Model cleared — using the SDK default on the next turn.'
          : `Model set to "${next}" — applies on the next turn.`,
        'info'
      )
    },
    [appendSystemMessage]
  )

  const openModelPicker = useCallback(() => {
    setState((prev) => ({ ...prev, modelPickerOpen: true }))
  }, [])

  const closeModelPicker = useCallback(() => {
    setState((prev) => ({ ...prev, modelPickerOpen: false }))
  }, [])

  const setProvider = useCallback(
    (next: ProviderId) => {
      let changed = false
      setState((prev) => {
        if (prev.provider === next) {
          return prev.providerPickerOpen
            ? { ...prev, providerPickerOpen: false }
            : prev
        }
        changed = true
        return {
          ...prev,
          provider: next,
          providerPickerOpen: false,
          // Reset token usage so per-provider numbers do not bleed together,
          // and bump agentEpoch so the new provider takes over immediately.
          usage: EMPTY_USAGE,
          agentEpoch: prev.agentEpoch + 1
        }
      })
      if (!changed) return
      saveActiveProvider(next)
      const meta = getProviderMeta(next)
      if (meta.needsCredential && !isProviderReady(next)) {
        appendSystemMessage(
          `${meta.label} has no stored credential — agent loop is paused. Run /provider to configure it.`,
          'warn'
        )
        return
      }
      appendSystemMessage(`Switched to ${meta.label}.`, 'info')
    },
    [appendSystemMessage]
  )

  const configureProvider = useCallback(
    (id: ApiProviderId, credential: ProviderCredentialInput) => {
      saveProviderCredential(id, credential)
      const meta = getProviderMeta(id)
      appendSystemMessage(`Saved ${meta.label} credential.`, 'info')
      // Activate the freshly-configured provider so the user gets immediate
      // feedback rather than having to switch a second time.
      setProvider(id)
    },
    [appendSystemMessage, setProvider]
  )

  const openProviderPicker = useCallback(() => {
    setState((prev) => ({ ...prev, providerPickerOpen: true }))
  }, [])

  const closeProviderPicker = useCallback(() => {
    setState((prev) => ({ ...prev, providerPickerOpen: false }))
  }, [])

  const stopImpersonation = useCallback(() => {
    setState((prev) => {
      if (prev.impersonating == null) return prev
      return {
        ...prev,
        impersonating: null,
        agentEpoch: prev.agentEpoch + 1,
        teams: { status: 'idle' },
        activeTeam: null,
        journeys: { status: 'idle' },
        activeJourney: null,
        cards: { status: 'idle' },
        activeCard: null,
        activeBlock: null
      }
    })
    setTeamsEpoch((n) => n + 1)
    setJourneysEpoch((n) => n + 1)
    appendSystemMessage('Stopped impersonating. Back to your own session.', 'info')
  }, [appendSystemMessage])

  const submitPrompt = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (trimmed.length === 0) return
      appendEntry({ kind: 'user', id: nextEntryId('user'), text: trimmed })
      beginThinking()
      promptQueue.current?.push(trimmed)
    },
    [appendEntry, beginThinking]
  )

  const commandContext = useMemo<CommandContext>(
    () => ({
      session: state.session,
      model: state.model,
      teams: state.teams,
      activeTeam: state.activeTeam,
      journeys: state.journeys,
      activeJourney: state.activeJourney,
      cards: state.cards,
      activeCard: state.activeCard,
      activeBlock: state.activeBlock,
      me: state.me,
      impersonating: state.impersonating,
      provider: state.provider,
      appendSystemMessage,
      submitPrompt,
      setSession: replaceSession,
      switchEnvironment,
      forceLogin,
      clearTranscript,
      openTeamPicker,
      setActiveTeam,
      refreshTeams,
      openJourneyPicker,
      setActiveJourney,
      refreshJourneys,
      openCardPicker,
      setActiveCard,
      refreshCards,
      openBlockPicker,
      setActiveBlock,
      startImpersonation,
      stopImpersonation,
      setModel,
      openModelPicker,
      setProvider,
      configureProvider,
      openProviderPicker,
      exit: () => exit()
    }),
    [
      state.session,
      state.model,
      state.teams,
      state.activeTeam,
      state.journeys,
      state.activeJourney,
      state.cards,
      state.activeCard,
      state.activeBlock,
      state.me,
      state.impersonating,
      state.provider,
      appendSystemMessage,
      submitPrompt,
      replaceSession,
      switchEnvironment,
      forceLogin,
      clearTranscript,
      openTeamPicker,
      setActiveTeam,
      refreshTeams,
      openJourneyPicker,
      setActiveJourney,
      refreshJourneys,
      openCardPicker,
      setActiveCard,
      refreshCards,
      openBlockPicker,
      setActiveBlock,
      startImpersonation,
      stopImpersonation,
      setModel,
      openModelPicker,
      setProvider,
      configureProvider,
      openProviderPicker,
      exit
    ]
  )

  const handleSubmit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (trimmed.length === 0) return

      if (trimmed.startsWith('/')) {
        appendEntry({
          kind: 'user',
          id: nextEntryId('user'),
          text: trimmed
        })
        const [name, ...args] = trimmed.slice(1).split(/\s+/)
        const command = findCommand(name)
        if (command == null) {
          appendSystemMessage(
            `Unknown command: /${name}. Type /help for the list.`,
            'error'
          )
          return
        }
        void Promise.resolve(command.run(args, commandContext)).catch(
          (error: unknown) => {
            appendSystemMessage(
              `/${name} failed: ${formatError(error)}`,
              'error'
            )
          }
        )
        return
      }

      appendEntry({ kind: 'user', id: nextEntryId('user'), text: trimmed })
      // Kick the activity indicator the moment the user submits — there can
      // be a noticeable gap before the SDK emits its first message.
      beginThinking()
      promptQueue.current?.push(trimmed)
    },
    [appendEntry, appendSystemMessage, commandContext, beginThinking]
  )

  // Fetch the operator's `me` profile (real user — never impersonated) once
  // per real session. Drives /impersonate availability and the "(impersonating)"
  // banner.
  useEffect(() => {
    let cancelled = false
    fetchMe(state.session)
      .then((me) => {
        if (cancelled) return
        setState((prev) => ({ ...prev, me }))
      })
      .catch(() => {
        // Failure here is non-fatal — /impersonate just won't show up in the
        // slash menu, and the API will reject the call with FORBIDDEN if the
        // user types it directly.
      })
    return () => {
      cancelled = true
    }
  }, [state.session])

  // Fetch the user's teams + their journeys-admin "last active team" whenever
  // the session, impersonation, or refresh epoch changes. Uses the effective
  // session so impersonated teams show up while impersonating.
  useEffect(() => {
    let cancelled = false
    const effective = getEffectiveSession(state)
    setState((prev) => ({ ...prev, teams: { status: 'loading' } }))
    fetchTeamsAndActiveTeam(effective)
      .then(({ teams, lastActiveTeamId }) => {
        if (cancelled) return
        setState((prev) => {
          const previous = prev.activeTeam
          // If the user already picked a team in this session, keep that
          // choice as long as it still exists. Otherwise seed from the
          // server-side lastActiveTeamId.
          let nextActive: TeamSelection | null
          if (previous != null) {
            const stillValid =
              previous.kind === 'shared' ||
              teams.some((t) => t.id === previous.team.id)
            nextActive = stillValid ? previous : null
          } else if (lastActiveTeamId == null) {
            // null in JourneyProfile means the user explicitly chose
            // "Shared with me" or has never picked. Mirror journeys-admin:
            // leave activeTeam null and let the status bar show "no team".
            nextActive = null
          } else {
            const team = teams.find((t) => t.id === lastActiveTeamId)
            nextActive = team != null ? { kind: 'team', team } : null
          }
          return {
            ...prev,
            teams: { status: 'loaded', teams },
            activeTeam: nextActive
          }
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : String(error)
        setState((prev) => ({
          ...prev,
          teams: { status: 'error', message }
        }))
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.session, state.impersonating, teamsEpoch])

  // Fetch journeys whenever the effective session, active team, or refresh
  // epoch changes. Scoped to the active team — for "Shared with me" (or no
  // team), the resolver returns shared/personal journeys.
  useEffect(() => {
    let cancelled = false
    const teamSelection = state.activeTeam
    const teamId =
      teamSelection?.kind === 'team' ? teamSelection.team.id : null
    const effective = getEffectiveSession(state)

    setState((prev) => ({ ...prev, journeys: { status: 'loading' } }))
    listJourneys(effective, { teamId })
      .then((journeys) => {
        if (cancelled) return
        setState((prev) => {
          const previous = prev.activeJourney
          // If the previously-active journey is still in scope, keep it.
          // Otherwise drop it so the user re-picks from the new list.
          const stillValid =
            previous != null &&
            journeys.some((j) => j.id === previous.id)
          return {
            ...prev,
            journeys: { status: 'loaded', journeys },
            activeJourney: stillValid ? previous : null
          }
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : String(error)
        setState((prev) => ({
          ...prev,
          journeys: { status: 'error', message }
        }))
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.session, state.activeTeam, state.impersonating, journeysEpoch])

  // Fetch the active journey's cards via journeySimpleGet whenever the
  // selected journey, effective session, or refresh epoch changes. With no
  // active journey, leave cards idle.
  useEffect(() => {
    const journey = state.activeJourney
    if (journey == null) return
    let cancelled = false
    const effective = getEffectiveSession(state)
    setState((prev) => ({ ...prev, cards: { status: 'loading' } }))
    fetchJourneySimple(effective, journey.id)
      .then((simple) => {
        if (cancelled) return
        setState((prev) => {
          // Bail if the user switched journeys mid-fetch — this result is
          // stale and would overwrite a fresh load.
          if (prev.activeJourney?.id !== journey.id) return prev
          const previous = prev.activeCard
          const stillValid =
            previous != null && simple.cards.some((c) => c.id === previous.id)
          return {
            ...prev,
            cards: { status: 'loaded', cards: simple.cards },
            activeCard: stillValid
              ? simple.cards.find((c) => c.id === previous.id) ?? null
              : null
          }
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof Error ? error.message : String(error)
        setState((prev) => {
          if (prev.activeJourney?.id !== journey.id) return prev
          return { ...prev, cards: { status: 'error', message } }
        })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.session,
    state.activeJourney,
    state.impersonating,
    cardsEpoch
  ])

  // Run the agent loop, restarting whenever the session or agent epoch
  // advances. Each restart instantiates the active provider, builds the tool
  // set, and wires the provider's events back into ReplState.
  useEffect(() => {
    const providerOrError = createProvider(state.provider)
    if (isInstantiationError(providerOrError)) {
      // Surface the error once per epoch and bail — the loop will restart on
      // the next agentEpoch bump (e.g. after the user configures credentials).
      appendSystemMessage(providerOrError.message, 'error')
      endActivity()
      return
    }

    const provider = providerOrError
    const controller = new AbortController()
    const queue = createPromptQueue()
    promptQueue.current = queue
    // The agent always operates with the effective session — under
    // impersonation, tool calls are authenticated as the impersonated user.
    const session = getEffectiveSession(state)
    const tools = buildJourneyTools(session, state.activeTeam)
    const systemPrompt = buildSystemPrompt({
      session,
      activeTeam: state.activeTeam,
      activeJourney: state.activeJourney,
      activeCard: state.activeCard,
      activeBlock: state.activeBlock,
      operatorEmail: state.session.email ?? null,
      impersonating: state.impersonating
    })

    void provider.run({
      systemPrompt,
      userPrompts: queue.iterable,
      tools,
      model: state.model ?? undefined,
      signal: controller.signal,
      onAssistantText: (text) => {
        beginThinking()
        appendEntry({
          kind: 'assistant',
          id: nextEntryId('asst'),
          text
        })
      },
      onToolCall: (name, input) => {
        beginTool(name)
        appendEntry({
          kind: 'tool_call',
          id: nextEntryId('tool'),
          name,
          input
        })
      },
      onUsage: (delta) => {
        setState((prev) => ({
          ...prev,
          usage: {
            inputTokens: prev.usage.inputTokens + (delta.inputTokens ?? 0),
            outputTokens: prev.usage.outputTokens + (delta.outputTokens ?? 0),
            cacheCreationInputTokens:
              prev.usage.cacheCreationInputTokens +
              (delta.cacheCreationInputTokens ?? 0),
            cacheReadInputTokens:
              prev.usage.cacheReadInputTokens +
              (delta.cacheReadInputTokens ?? 0),
            turns: prev.usage.turns + (delta.turns ?? 0)
          }
        }))
      },
      onTurnEnd: () => {
        endActivity()
      },
      onError: (message) => {
        appendSystemMessage(`Agent error: ${message}`, 'error')
        endActivity()
      }
    })

    return () => {
      controller.abort()
      queue.close()
      if (promptQueue.current === queue) promptQueue.current = null
    }
    // We intentionally restart the agent loop on session/provider/epoch change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.session, state.provider, state.agentEpoch])

  return (
    <Box flexDirection="column">
      <Header session={state.session} />
      <Transcript entries={state.transcript} />
      {state.teamPickerOpen ? (
        <TeamPicker
          teams={state.teams}
          activeTeam={state.activeTeam}
          onSelect={setActiveTeam}
          onCancel={closeTeamPicker}
        />
      ) : state.journeyPickerOpen ? (
        <JourneyPicker
          journeys={state.journeys}
          activeJourney={state.activeJourney}
          onSelect={setActiveJourney}
          onCancel={closeJourneyPicker}
        />
      ) : state.cardPickerOpen ? (
        <CardPicker
          cards={state.cards}
          activeCard={state.activeCard}
          onSelect={setActiveCard}
          onCancel={closeCardPicker}
        />
      ) : state.blockPickerOpen ? (
        <BlockPicker
          card={state.activeCard}
          activeBlock={state.activeBlock}
          onSelect={setActiveBlock}
          onCancel={closeBlockPicker}
        />
      ) : state.modelPickerOpen ? (
        <ModelPicker
          activeModel={state.model}
          onSelect={setModel}
          onCancel={closeModelPicker}
        />
      ) : state.providerPickerOpen ? (
        <ProviderPicker
          activeProvider={state.provider}
          onSelect={setProvider}
          onConfigure={configureProvider}
          onCancel={closeProviderPicker}
        />
      ) : (
        <>
          <ActivityIndicator
            status={state.status}
            currentToolName={state.currentToolName}
            startedAt={state.activityStartedAt}
          />
          <Input
            enabled={true}
            placeholder="Ask the agent, or type / for commands"
            onSubmit={handleSubmit}
            commandContext={commandContext}
            history={promptHistory}
          />
        </>
      )}
      <StatusBar
        session={state.session}
        status={state.status}
        usage={state.usage}
        teams={state.teams}
        activeTeam={state.activeTeam}
        journeys={state.journeys}
        activeJourney={state.activeJourney}
        activeCard={state.activeCard}
        activeBlock={state.activeBlock}
        impersonating={state.impersonating}
        model={state.model}
        provider={state.provider}
      />
    </Box>
  )
}

function Header({ session }: { session: ActiveSession }): ReactElement {
  return (
    <Box marginBottom={1}>
      <Text bold>scribe </Text>
      <Text color="gray">— interactive Core agent · {session.environment.label}</Text>
    </Box>
  )
}

interface PromptQueue {
  iterable: AsyncIterable<string>
  push: (text: string) => void
  close: () => void
}

function createPromptQueue(): PromptQueue {
  let resolveNext: ((value: IteratorResult<string>) => void) | null = null
  const buffer: string[] = []
  let closed = false

  function flush(): void {
    if (resolveNext == null) return
    if (closed) {
      const resolver = resolveNext
      resolveNext = null
      resolver({ value: undefined, done: true })
      return
    }
    const next = buffer.shift()
    if (next == null) return
    const resolver = resolveNext
    resolveNext = null
    resolver({ value: next, done: false })
  }

  const iterable: PromptQueue['iterable'] = {
    [Symbol.asyncIterator]() {
      return {
        next() {
          return new Promise((resolve) => {
            if (closed) {
              resolve({ value: undefined, done: true })
              return
            }
            resolveNext = resolve
            flush()
          })
        },
        async return() {
          closed = true
          flush()
          return { value: undefined, done: true }
        }
      }
    }
  }

  return {
    iterable,
    push(text) {
      if (closed) return
      buffer.push(text)
      flush()
    },
    close() {
      closed = true
      flush()
    }
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
