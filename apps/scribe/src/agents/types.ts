import type { ToolDefinition } from '@anthropic-ai/claude-agent-sdk'

import type { ProviderId } from '../config/providers'

/**
 * Backend-neutral tool shape. Identical to what
 * `@anthropic-ai/claude-agent-sdk`'s `tool()` factory produces, which lets the
 * Claude backend consume it without a wrapper. Other backends (OpenAI-compat)
 * convert the Zod input schema to JSON Schema before sending it upstream.
 */
export type RawTool = ToolDefinition

export interface UsageDelta {
  inputTokens?: number
  outputTokens?: number
  cacheCreationInputTokens?: number
  cacheReadInputTokens?: number
  turns?: number
}

export interface AgentRunArgs {
  systemPrompt: string
  /**
   * Stream of raw user prompts (one string per submitted turn). The provider
   * is responsible for translating each into its native message format and
   * driving the tool loop until the model is done with that turn.
   */
  userPrompts: AsyncIterable<string>
  tools: RawTool[]
  /** Pass-through model id. Provider-specific. */
  model?: string
  signal: AbortSignal
  onAssistantText: (text: string) => void
  onToolCall: (name: string, input: unknown) => void
  onUsage: (delta: UsageDelta) => void
  /** Fired once when a turn is fully resolved (model finished responding). */
  onTurnEnd: () => void
  /**
   * Fired when the provider encounters a recoverable error mid-turn (e.g.
   * HTTP failure, JSON parse error). The provider may then continue to wait
   * for the next user prompt rather than aborting the whole loop.
   */
  onError: (message: string) => void
}

export interface AgentProvider {
  readonly id: ProviderId
  readonly label: string
  run(args: AgentRunArgs): Promise<void>
}

export interface ProviderMeta {
  id: ProviderId
  label: string
  description: string
  /**
   * True if this provider's configuration is stored in providers.json (API
   * key and/or base URL). When false, the provider runs without any stored
   * config (e.g. Claude Code rides on its own credentials).
   */
  needsCredential: boolean
  /**
   * True if the provider requires a user-supplied API key. Defaults to true
   * for backends like OpenRouter/Hermes; false for local-only backends like
   * LM Studio that authenticate against the user's own machine.
   */
  needsApiKey: boolean
  /** True if the provider also requires a user-supplied base URL. */
  needsBaseUrl: boolean
  /** Default base URL used when none is stored. */
  defaultBaseUrl?: string
}
