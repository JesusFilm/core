import { Message } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { TextPart } from './TextPart'
import { ToolInvocationPart } from './ToolInvocationPart'

interface MessageListProps {
  messages: Message[]
  addToolResult: ({
    toolCallId,
    result
  }: {
    toolCallId: string
    result: any
  }) => void
}

export function MessageList({
  messages,
  addToolResult
}: MessageListProps): ReactElement {
  return (
    <>
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor:
              message.role === 'user' ? 'action.selected' : 'background.paper',
            py: message.role === 'user' ? 2 : 0,
            px: message.role === 'user' ? 3 : 0,
            borderRadius: 2,
            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            '& > p': {
              m: 0
            }
          }}
        >
          {message.parts?.map((part, i) => {
            switch (part.type) {
              case 'text':
                return (
                  <TextPart
                    key={`${message.id}-${i}`}
                    message={message}
                    part={part}
                  />
                )
              case 'tool-invocation':
                return (
                  <ToolInvocationPart
                    key={`${message.id}-${part.toolInvocation.toolCallId}`}
                    part={part}
                    addToolResult={addToolResult}
                  />
                )
              default:
                return null
            }
          })}
        </Box>
      ))}
    </>
  )
}
