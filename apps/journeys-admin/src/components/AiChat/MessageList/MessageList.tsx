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
      {messages
        .map((message) => {
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
                        return <TextPart message={message} part={part} />
                      case 'tool-invocation':
                        return (
                          <ToolInvocationPart
                            part={part}
                            addToolResult={addToolResult}
                          />
                        )
                      default:
                        return null
                    }
                  })}
                </Box>
              )
          }
        })
        .reverse()}
    </>
  )
}
