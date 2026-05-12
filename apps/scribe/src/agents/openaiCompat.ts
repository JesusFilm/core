import { z } from 'zod'

import type { ProviderId } from '../config/providers'

import type {
  AgentProvider,
  AgentRunArgs,
  ProviderModel,
  RawTool,
  UsageDelta
} from './types'

interface OpenAICompatConfig {
  id: Extract<ProviderId, 'openrouter' | 'hermes' | 'lm-studio' | 'ollama'>
  label: string
  apiKey: string
  baseUrl: string
  /**
   * Optional fallback model used when `AgentRunArgs.model` is undefined. The
   * OpenAI-compatible chat endpoint rejects requests without a model id, so a
   * provider with no caller-supplied model and no default surfaces a clear
   * error before the request goes out.
   */
  defaultModel?: string
  /** Optional extra headers (e.g. OpenRouter's HTTP-Referer / X-Title). */
  extraHeaders?: Record<string, string>
}

interface OpenAITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

interface OpenAIToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

type OpenAIMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | {
      role: 'assistant'
      content: string | null
      tool_calls?: OpenAIToolCall[]
    }
  | { role: 'tool'; tool_call_id: string; content: string }

interface OpenAIResponseChoice {
  message: {
    role: 'assistant'
    content: string | null
    tool_calls?: OpenAIToolCall[]
  }
  finish_reason: string | null
}

interface OpenAIResponse {
  choices: OpenAIResponseChoice[]
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

interface OpenAIModelsResponse {
  data: Array<{
    id: string
    /** OpenRouter-specific friendly name. */
    name?: string
    /** OpenRouter-specific description. */
    description?: string
  }>
}

export function createOpenAICompatProvider(
  config: OpenAICompatConfig
): AgentProvider {
  return {
    id: config.id,
    label: config.label,
    async listModels(signal: AbortSignal): Promise<ProviderModel[]> {
      const url = joinUrl(config.baseUrl, 'models')
      const headers: Record<string, string> = {
        ...config.extraHeaders
      }
      if (config.apiKey.length > 0) {
        headers.Authorization = `Bearer ${config.apiKey}`
      }
      const response = await fetch(url, { headers, signal })
      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        throw new Error(
          `${config.label} GET /models failed (HTTP ${response.status}): ${truncate(detail, 200)}`
        )
      }
      const payload = (await response.json()) as Partial<OpenAIModelsResponse>
      if (payload.data == null || !Array.isArray(payload.data)) return []
      return payload.data.map((entry) => ({
        id: entry.id,
        label: entry.name,
        description: entry.description
      }))
    },
    async run(args: AgentRunArgs): Promise<void> {
      const {
        systemPrompt,
        userPrompts,
        tools,
        model,
        signal,
        onAssistantText,
        onToolCall,
        onUsage,
        onTurnEnd,
        onError
      } = args

      const resolvedModel = model ?? config.defaultModel
      if (resolvedModel == null || resolvedModel.length === 0) {
        onError(
          `${config.label} requires an explicit model. Set one with /model and try again.`
        )
        return
      }

      const openaiTools = tools.map(toOpenAITool)
      const toolsByName = new Map(tools.map((t) => [t.name, t]))
      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemPrompt }
      ]

      try {
        for await (const userText of userPrompts) {
          if (signal.aborted) return
          messages.push({ role: 'user', content: userText })

          // Tool-loop within a single turn. Each iteration sends the full
          // conversation, applies any tool_calls, and loops until the model
          // returns a turn with no tool_calls.
          let turnUsage: UsageDelta = { turns: 1 }
          for (;;) {
            if (signal.aborted) return
            const response = await callChatCompletion({
              config,
              model: resolvedModel,
              messages,
              tools: openaiTools,
              signal
            })

            turnUsage = mergeUsage(turnUsage, response.usage)
            const choice = response.choices[0]
            if (choice == null) {
              onError(
                `${config.label} returned no choices in the response.`
              )
              break
            }

            const assistantMessage = choice.message
            const toolCalls = assistantMessage.tool_calls ?? []
            const assistantContent = assistantMessage.content ?? ''

            if (toolCalls.length === 0) {
              if (assistantContent.trim().length > 0) {
                onAssistantText(assistantContent)
              }
              messages.push({
                role: 'assistant',
                content: assistantContent
              })
              break
            }

            // Surface any text the model produced alongside the tool calls
            // before we execute the tools.
            if (assistantContent.trim().length > 0) {
              onAssistantText(assistantContent)
            }
            messages.push({
              role: 'assistant',
              content: assistantContent.length > 0 ? assistantContent : null,
              tool_calls: toolCalls
            })

            for (const call of toolCalls) {
              if (signal.aborted) return
              const tool = toolsByName.get(call.function.name)
              if (tool == null) {
                const detail = `Tool "${call.function.name}" is not available.`
                onToolCall(call.function.name, {
                  raw: call.function.arguments
                })
                messages.push({
                  role: 'tool',
                  tool_call_id: call.id,
                  content: `Error: ${detail}`
                })
                continue
              }
              const parsedInput = parseToolArgs(call.function.arguments)
              onToolCall(call.function.name, parsedInput)
              const text = await runTool(tool, parsedInput)
              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                content: text
              })
            }
          }

          onUsage(turnUsage)
          onTurnEnd()
        }
      } catch (error) {
        if (signal.aborted) return
        onError(error instanceof Error ? error.message : String(error))
      }
    }
  }
}

async function callChatCompletion(args: {
  config: OpenAICompatConfig
  model: string
  messages: OpenAIMessage[]
  tools: OpenAITool[]
  signal: AbortSignal
}): Promise<OpenAIResponse> {
  const { config, model, messages, tools, signal } = args
  const url = joinUrl(config.baseUrl, 'chat/completions')
  // Local backends (LM Studio) commonly run without auth; omit the
  // Authorization header entirely rather than sending an empty Bearer token
  // that some servers reject.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.extraHeaders
  }
  if (config.apiKey.length > 0) {
    headers.Authorization = `Bearer ${config.apiKey}`
  }
  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers,
    body: JSON.stringify({
      model,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? 'auto' : undefined
    })
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `${config.label} API error (HTTP ${response.status}): ${truncate(detail, 400)}`
    )
  }
  return (await response.json()) as OpenAIResponse
}

async function runTool(
  tool: RawTool,
  input: Record<string, unknown>
): Promise<string> {
  try {
    const result = await tool.handler(input as never)
    const text = (result.content ?? [])
      .map((block) => block.text)
      .join('\n')
      .trim()
    if (result.isError === true) {
      return text.length > 0 ? `Error: ${text}` : 'Error: tool reported failure.'
    }
    return text.length > 0 ? text : '(empty result)'
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return `Error: ${message}`
  }
}

function parseToolArgs(raw: string): Record<string, unknown> {
  if (raw == null || raw.length === 0) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return { _raw: parsed }
  } catch {
    return { _raw: raw }
  }
}

function toOpenAITool(tool: RawTool): OpenAITool {
  const schema = z.toJSONSchema(z.object(tool.inputSchema)) as Record<
    string,
    unknown
  >
  // OpenAI rejects the `$schema` marker; strip it and any sibling JSON-Schema
  // meta keys that don't belong in a function-parameters payload.
  delete schema.$schema
  delete schema.$id
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: schema
    }
  }
}

function mergeUsage(
  current: UsageDelta,
  next: OpenAIResponse['usage']
): UsageDelta {
  if (next == null) return current
  return {
    ...current,
    inputTokens: (current.inputTokens ?? 0) + (next.prompt_tokens ?? 0),
    outputTokens: (current.outputTokens ?? 0) + (next.completion_tokens ?? 0)
  }
}

function joinUrl(base: string, path: string): string {
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const trimmedPath = path.startsWith('/') ? path.slice(1) : path
  return `${trimmedBase}/${trimmedPath}`
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}
