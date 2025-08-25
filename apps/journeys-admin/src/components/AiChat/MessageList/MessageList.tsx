import { Message, UseChatHelpers } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { TextPart } from './TextPart'
import { ToolInvocationPart } from './ToolInvocationPart'
import { UserFeedback } from './UserFeedback'

interface MessageListProps {
  status: UseChatHelpers['status']
  messages: (Message & { traceId?: string | null })[]
  addToolResult: ({
    toolCallId,
    result
  }: {
    toolCallId: string
    result: any
  }) => void
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
                    switch (part.type) {
                      case 'text':
                        return (
                          <TextPart
                            message={message}
                            part={part}
                            key={`text-${i}`}
                          />
                        )
                      case 'tool-invocation':
                        return (
                          <ToolInvocationPart
                            part={part}
                            addToolResult={addToolResult}
                            key={`tool-invocation-${i}`}
                          />
                        )
                      default:
                        return null
                    }
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
