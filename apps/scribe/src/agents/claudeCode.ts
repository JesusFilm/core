import {
  type SDKMessage,
  type UserMessage,
  createSdkMcpServer,
  query
} from '@anthropic-ai/claude-agent-sdk'

import type { AgentProvider, AgentRunArgs } from './types'

const SERVER_NAME = 'scribe'

export function createClaudeCodeProvider(): AgentProvider {
  return {
    id: 'claude-code',
    label: 'Claude Code',
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

      const mcpServer = createSdkMcpServer({
        name: SERVER_NAME,
        version: '0.1.0',
        tools
      })
      const allowedTools = tools.map((t) => `mcp__${SERVER_NAME}__${t.name}`)

      const stream = query({
        prompt: toSdkUserMessages(userPrompts),
        options: {
          systemPrompt,
          mcpServers: { [SERVER_NAME]: mcpServer },
          allowedTools,
          model,
          permissionMode: 'default'
        }
      })

      try {
        for await (const message of stream) {
          if (signal.aborted) return
          handleMessage(message)
        }
      } catch (error) {
        if (signal.aborted) return
        onError(error instanceof Error ? error.message : String(error))
      }

      function handleMessage(message: SDKMessage): void {
        if (message.type === 'assistant') {
          const blocks = message.message?.content
          if (!Array.isArray(blocks)) return
          for (const block of blocks) {
            if (block.type === 'text' && block.text.trim().length > 0) {
              onAssistantText(block.text)
              continue
            }
            if (block.type === 'tool_use') {
              onToolCall(block.name, block.input)
            }
          }
          return
        }
        if (message.type === 'result') {
          const usage = message.usage
          onUsage({
            inputTokens: usage?.input_tokens ?? 0,
            outputTokens: usage?.output_tokens ?? 0,
            cacheCreationInputTokens: usage?.cache_creation_input_tokens ?? 0,
            cacheReadInputTokens: usage?.cache_read_input_tokens ?? 0,
            turns: message.num_turns ?? 1
          })
          onTurnEnd()
        }
      }
    }
  }
}

async function* toSdkUserMessages(
  prompts: AsyncIterable<string>
): AsyncIterable<UserMessage> {
  for await (const text of prompts) {
    yield { type: 'user', message: { role: 'user', content: text } }
  }
}
