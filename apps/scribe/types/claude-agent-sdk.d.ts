// Minimal local type surface for `@anthropic-ai/claude-agent-sdk`.
//
// This file lets `apps/scribe` type-check before `pnpm install` pulls the
// real package. After installation the package ships its own types — TypeScript
// merges these declarations and prefers the ones in node_modules when there is
// overlap, so this file remains harmless.
//
// Keep this surface in sync with the calls made by:
//   - src/repl/runRepl.ts
//   - src/tools/journey/index.ts
declare module '@anthropic-ai/claude-agent-sdk' {
  import type { ZodType } from 'zod'

  export type ZodShape = Record<string, ZodType>

  export interface ToolResultBlock {
    type: 'text'
    text: string
  }

  export interface ToolResult {
    content: ToolResultBlock[]
    isError?: boolean
  }

  export interface ToolDefinition<TShape extends ZodShape = ZodShape> {
    name: string
    description: string
    inputSchema: TShape
    handler: (input: ZodInferObject<TShape>) => Promise<ToolResult>
  }

  // Helper to mirror zod's z.infer over a shape.
  type ZodInferObject<TShape extends ZodShape> = {
    [K in keyof TShape]: TShape[K] extends ZodType<infer U> ? U : never
  }

  export function tool<TShape extends ZodShape>(
    name: string,
    description: string,
    inputSchema: TShape,
    handler: (input: ZodInferObject<TShape>) => Promise<ToolResult>
  ): ToolDefinition

  export interface SdkMcpServer {
    name: string
    version: string
    tools: ToolDefinition[]
  }

  export function createSdkMcpServer(options: {
    name: string
    version: string
    tools: ToolDefinition[]
  }): SdkMcpServer

  export type PermissionMode =
    | 'default'
    | 'acceptEdits'
    | 'bypassPermissions'
    | 'plan'

  export interface QueryOptions {
    systemPrompt?: string
    mcpServers?: Record<string, SdkMcpServer>
    allowedTools?: string[]
    model?: string
    permissionMode?: PermissionMode
  }

  export interface UserMessage {
    type: 'user'
    message: { role: 'user'; content: string }
  }

  export interface AssistantContentTextBlock {
    type: 'text'
    text: string
  }

  export interface AssistantContentToolUseBlock {
    type: 'tool_use'
    name: string
    input: unknown
  }

  export type AssistantContentBlock =
    | AssistantContentTextBlock
    | AssistantContentToolUseBlock

  export interface AssistantMessage {
    type: 'assistant'
    message: { role: 'assistant'; content: AssistantContentBlock[] }
  }

  export interface UsageInfo {
    input_tokens?: number
    output_tokens?: number
    cache_creation_input_tokens?: number
    cache_read_input_tokens?: number
  }

  export interface ResultMessage {
    type: 'result'
    subtype?: string
    is_error?: boolean
    duration_ms?: number
    duration_api_ms?: number
    num_turns?: number
    total_cost_usd?: number
    usage?: UsageInfo
    session_id?: string
    result?: string
  }

  export type SDKMessage = UserMessage | AssistantMessage | ResultMessage

  export interface QueryInput {
    prompt: string | AsyncIterable<UserMessage>
    options?: QueryOptions
  }

  export function query(input: QueryInput): AsyncIterable<SDKMessage>
}
