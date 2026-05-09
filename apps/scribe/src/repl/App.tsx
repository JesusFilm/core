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

import { Input } from './components/Input'
import { StatusBar } from './components/StatusBar'
import { Transcript } from './components/Transcript'
import { findCommand } from './commands/registry'
import type { CommandContext } from './commands/types'
import { buildSystemPrompt } from './systemPrompt'
import type { ReplState, TranscriptEntry, UsageTotals } from './state/types'

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
    agentEpoch: 0
  }))

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
      agentEpoch: prev.agentEpoch + 1
    }))
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

  const commandContext = useMemo<CommandContext>(
    () => ({
      session: state.session,
      appendSystemMessage,
      setSession: replaceSession,
      switchEnvironment,
      forceLogin,
      clearTranscript,
      exit: () => exit()
    }),
    [
      state.session,
      appendSystemMessage,
      replaceSession,
      switchEnvironment,
      forceLogin,
      clearTranscript,
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
        systemPrompt: buildSystemPrompt(session),
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
      <Input
        enabled={true}
        placeholder="Ask the agent, or type / for commands"
        onSubmit={handleSubmit}
      />
      <StatusBar
        session={state.session}
        status={state.status}
        usage={state.usage}
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
