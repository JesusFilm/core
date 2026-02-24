import { getToolOrDynamicToolName, isToolOrDynamicToolUIPart, UIMessage } from 'ai'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { TextPart } from './TextPart'
import { ToolInvocationPart } from './ToolInvocationPart'
import { UserFeedback } from './UserFeedback'

export type AddToolResultArg = {
  tool: string
  toolCallId: string
  result: unknown
}

/** Normalize v5 tool part to legacy shape for existing UI components (toolInvocation.state: 'call' | 'result', args/result). */
export function normalizeToolPart(
  part: Parameters<typeof isToolOrDynamicToolUIPart>[0]
): LegacyToolInvocationPart {
  const toolName = getToolOrDynamicToolName(part)
  const state =
    part.state === 'output-available' || part.state === 'output-error'
      ? 'result'
      : 'call'
  const input = 'input' in part ? part.input : undefined
  const output = 'output' in part ? part.output : undefined
  return {
    toolInvocation: {
      toolName,
      toolCallId: part.toolCallId,
      state,
      args: input,
      ...(part.state === 'output-available' && output !== undefined
        ? { result: output }
        : {})
    }
  }
}

export type LegacyToolInvocationPart = {
  toolInvocation: {
    toolName: string
    toolCallId: string
    state: 'call' | 'result'
    args: unknown
    result?: unknown
  }
}

interface MessageListProps {
  status: 'ready' | 'submitted' | 'streaming' | 'error'
  messages: (UIMessage & { traceId?: string | null })[]
  addToolResult: (arg: AddToolResultArg) => void
}

export function MessageList({
  status,
  messages,
  addToolResult
}: MessageListProps): ReactElement {
  return (
    <>
      {messages
        .map((message) => {
          const isLastMessage = messages[messages.length - 1].id === message.id
          switch (message.role) {
            case 'system':
              return null
            default:
              return (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    '& > div + div': {
                      mt: 2
                    },
                    '&:last-child .text-part': {
                      mt: 0
                    },
                    '&:nth-last-child .text-part': {
                      mb: 0
                    }
                  }}
                >
                  {message.parts?.map((part, i) => {
                    if (part.type === 'text') {
                      return (
                        <TextPart
                          message={message}
                          part={part}
                          key={`text-${i}`}
                        />
                      )
                    }
                    if (isToolOrDynamicToolUIPart(part)) {
                      return (
                        <ToolInvocationPart
                          part={normalizeToolPart(part)}
                          addToolResult={addToolResult}
                          key={`tool-${part.toolCallId}-${i}`}
                        />
                      )
                    }
                    return null
                  })}
                  {((isLastMessage && status === 'ready') || !isLastMessage) &&
                    message.traceId && (
                      <UserFeedback traceId={message.traceId} />
                    )}
                </Box>
              )
          }
        })
        .reverse()}
    </>
  )
}
