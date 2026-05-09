import {
  createSdkMcpServer,
  query,
  type SDKMessage
} from '@anthropic-ai/claude-agent-sdk'
import { Box, Text, useApp } from 'ink'
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import type { ActiveSession } from '../auth/login'
import { ensureSession } from '../auth/login'
import { clearCredential } from '../config/credentials'
import { getEnvironment, type EnvironmentId } from '../config/environments'
import { buildJourneyTools } from '../tools/journey'
import {
  type JourneyListItem,
  listJourneys
} from '../tools/journey/api'
import {
  fetchTeamsAndActiveTeam,
  persistLastActiveTeamId
} from '../tools/team/api'

import { Input } from './components/Input'
import { JourneyPicker } from './components/JourneyPicker'
import { StatusBar } from './components/StatusBar'
import { TeamPicker, describeSelection } from './components/TeamPicker'
import { Transcript } from './components/Transcript'
import { findCommand } from './commands/registry'
import type { CommandContext } from './commands/types'
import { buildSystemPrompt } from './systemPrompt'
import type {
  ReplState,
  TeamSelection,
  TranscriptEntry,
  UsageTotals
} from './state/types'

const SERVER_NAME = 'scribe'
const EMPTY_USAGE: UsageTotals = {
  inputTokens: 0,
  outputTokens: 0,
  cacheCreationInputTokens: 0,
  cacheReadInputTokens: 0,
  turns: 0
}

interface AppProps {
  initialSession: ActiveSession
  model?: string
}

let entryIdSeq = 0
function nextEntryId(prefix: string): string {
  entryIdSeq += 1
  return `${prefix}-${entryIdSeq}`
}

export function App({ initialSession, model }: AppProps): ReactElement {
  const { exit } = useApp()
  const [state, setState] = useState<ReplState>(() => ({
    session: initialSession,
    transcript: [
      {
        kind: 'system',
        id: nextEntryId('sys'),
        text: `Signed in to ${initialSession.environment.label}${
          initialSession.email != null ? ` as ${initialSession.email}` : ''
        }. Type / for commands.`,
        tone: 'info'
      }
    ],
    usage: EMPTY_USAGE,
    status: 'idle',
    agentEpoch: 0,
    teams: { status: 'idle' },
    activeTeam: null,
    teamPickerOpen: false,
    journeys: { status: 'idle' },
    activeJourney: null,
    journeyPickerOpen: false
  }))
  // Bumped to force a teams refetch (e.g. after a load error, or on /env switch).
  const [teamsEpoch, setTeamsEpoch] = useState(0)
  const [journeysEpoch, setJourneysEpoch] = useState(0)

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

  const setStatus = useCallback((status: ReplState['status']) => {
    setState((prev) => ({ ...prev, status }))
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
      journeyPickerOpen: false
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
      void persistLastActiveTeamId(state.session, persistedId).catch(
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
        // Restart the agent loop so the next turn sees the updated journey
        // context in the system prompt.
        agentEpoch: prev.agentEpoch + 1
      }))
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

  const commandContext = useMemo<CommandContext>(
    () => ({
      session: state.session,
      teams: state.teams,
      activeTeam: state.activeTeam,
      journeys: state.journeys,
      activeJourney: state.activeJourney,
      appendSystemMessage,
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
      exit: () => exit()
    }),
    [
      state.session,
      state.teams,
      state.activeTeam,
      state.journeys,
      state.activeJourney,
      appendSystemMessage,
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
      promptQueue.current?.push(trimmed)
    },
    [appendEntry, appendSystemMessage, commandContext]
  )

  // Fetch the user's teams + their journeys-admin "last active team" whenever
  // the session changes or a refresh is requested. The persisted lastActiveTeamId
  // is used to seed the active selection so scribe matches what the user already
  // has selected in journeys-admin.
  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, teams: { status: 'loading' } }))
    fetchTeamsAndActiveTeam(state.session)
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
  }, [state.session, teamsEpoch])

  // Fetch journeys whenever the session, active team, or refresh epoch
  // changes. The query is scoped to the active team — for "Shared with me"
  // (or no team), the resolver returns shared/personal journeys.
  useEffect(() => {
    let cancelled = false
    const teamSelection = state.activeTeam
    const teamId =
      teamSelection?.kind === 'team' ? teamSelection.team.id : null

    setState((prev) => ({ ...prev, journeys: { status: 'loading' } }))
    listJourneys(state.session, { teamId })
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
  }, [state.session, state.activeTeam, journeysEpoch])

  // Run the agent loop, restarting whenever the session epoch advances.
  useEffect(() => {
    let cancelled = false
    const queue = createPromptQueue()
    promptQueue.current = queue
    const session = state.session
    const tools = buildJourneyTools(session)
    const allowedTools = tools.map(
      (tool) => `mcp__${SERVER_NAME}__${tool.name}`
    )
    const mcpServer = createSdkMcpServer({
      name: SERVER_NAME,
      version: '0.1.0',
      tools
    })

    const stream = query({
      prompt: queue.iterable,
      options: {
        systemPrompt: buildSystemPrompt({
          session,
          activeTeam: state.activeTeam,
          activeJourney: state.activeJourney
        }),
        mcpServers: { [SERVER_NAME]: mcpServer },
        allowedTools,
        model,
        permissionMode: 'default'
      }
    })

    async function run(): Promise<void> {
      try {
        for await (const message of stream as AsyncIterable<SDKMessage>) {
          if (cancelled) return
          handleAgentMessage(message)
        }
      } catch (error) {
        if (cancelled) return
        appendSystemMessage(`Agent error: ${formatError(error)}`, 'error')
        setStatus('idle')
      }
    }

    function handleAgentMessage(message: SDKMessage): void {
      if (message.type === 'assistant') {
        const blocks = message.message?.content
        if (!Array.isArray(blocks)) return
        for (const block of blocks) {
          if (block.type === 'text' && block.text.trim().length > 0) {
            setStatus('thinking')
            appendEntry({
              kind: 'assistant',
              id: nextEntryId('asst'),
              text: block.text
            })
          } else if (block.type === 'tool_use') {
            setStatus('tool')
            appendEntry({
              kind: 'tool_call',
              id: nextEntryId('tool'),
              name: block.name,
              input: block.input
            })
          }
        }
        return
      }
      if (message.type === 'result') {
        const usage = message.usage
        setState((prev) => ({
          ...prev,
          status: 'idle',
          usage: {
            inputTokens: prev.usage.inputTokens + (usage?.input_tokens ?? 0),
            outputTokens: prev.usage.outputTokens + (usage?.output_tokens ?? 0),
            cacheCreationInputTokens:
              prev.usage.cacheCreationInputTokens +
              (usage?.cache_creation_input_tokens ?? 0),
            cacheReadInputTokens:
              prev.usage.cacheReadInputTokens +
              (usage?.cache_read_input_tokens ?? 0),
            turns: prev.usage.turns + (message.num_turns ?? 1)
          }
        }))
      }
    }

    void run()

    return () => {
      cancelled = true
      queue.close()
      if (promptQueue.current === queue) promptQueue.current = null
    }
    // We intentionally restart the agent loop on session/epoch change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.session, state.agentEpoch])

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
      ) : (
        <Input
          enabled={true}
          placeholder="Ask the agent, or type / for commands"
          onSubmit={handleSubmit}
        />
      )}
      <StatusBar
        session={state.session}
        status={state.status}
        usage={state.usage}
        teams={state.teams}
        activeTeam={state.activeTeam}
        journeys={state.journeys}
        activeJourney={state.activeJourney}
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
  iterable: AsyncIterable<{
    type: 'user'
    message: { role: 'user'; content: string }
  }>
  push: (text: string) => void
  close: () => void
}

function createPromptQueue(): PromptQueue {
  let resolveNext:
    | ((
        value: IteratorResult<{
          type: 'user'
          message: { role: 'user'; content: string }
        }>
      ) => void)
    | null = null
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
    resolver({
      value: { type: 'user', message: { role: 'user', content: next } },
      done: false
    })
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
