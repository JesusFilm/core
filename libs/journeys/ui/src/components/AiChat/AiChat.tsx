import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { CopyIcon, Loader, RefreshCcwIcon } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { Fragment, useEffect, useState } from 'react'

import { extractTypographyContent } from './utils/contextExtraction'
import {
  Action,
  Actions
} from '../../../../../../apps/journeys/src/components/Actions'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '../../../../../../apps/journeys/src/components/Conversation'
import {
  Message,
  MessageContent
} from '../../../../../../apps/journeys/src/components/Message'
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar
} from '../../../../../../apps/journeys/src/components/PromptInput'
import { Response } from '../../../../../../apps/journeys/src/components/Response'
import {
  Suggestion,
  Suggestions
} from '../../../../../../apps/journeys/src/components/Suggestion'
import { TreeBlock, useBlocks } from '../../libs/block'

interface AiChatProps {
  open: boolean
}

export function AiChat({ open }: AiChatProps) {
  const { t } = useTranslation('apps-journeys')
  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    }),
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'Hi, how can I help you?'
          }
        ]
      }
    ]
  })
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>()
  const { blockHistory } = useBlocks()

  const activeBlock = blockHistory.at(-1)

  async function fetchSuggestions() {
    try {
      const contextText = extractTypographyContent(activeBlock as TreeBlock)
      if (contextText === '') {
        setSuggestions([])
        return
      }

      const response = await fetch('/api/chat/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextText })
      })

      if (!response.ok) throw new Error('Failed to fetch suggestions')

      const suggestions: string[] = await response.json()

      setSuggestions(suggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    }
  }

  useEffect(() => {
    if (!open) return

    void fetchSuggestions()
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) {
      void sendMessage({ text: input })
      setInput('')
    }
  }

  function handleSuggestionClick(suggestion: string) {
    void sendMessage({ text: suggestion })
  }

  return (
    <div className="h-full bg-background rounded-lg">
      <div className="flex flex-col h-full p-4">
        <Conversation className="flex-1 bg-background-paper rounded-lg border border-secondary-light">
          <ConversationContent className="h-full">
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              {message.parts.map((part, i) => {
                                switch (part.type) {
                                  case 'text': // we don't use any reasoning or tool calls in this example
                                    return <Response>{part.text}</Response>
                                  default:
                                    return null
                                }
                              })}
                            </MessageContent>
                          </Message>
                          {message.role === 'assistant' &&
                            message.id === messages.at(-1)?.id && (
                              <Actions className="mt-2">
                                <Action
                                  onClick={() => regenerate()}
                                  label={t('Retry')}
                                  tooltip={t('Retry')}
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </Action>
                                <Action
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label={t('Copy')}
                                  tooltip={t('Copy')}
                                >
                                  <CopyIcon className="size-3" />
                                </Action>
                              </Actions>
                            )}
                        </Fragment>
                      )
                    default:
                      return null
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && (
              <div className="flex justify-center p-4">
                <Loader className="text-muted-foreground animate-spin" />
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <Suggestions>
          {suggestions?.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={handleSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>
        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4 w-full bg-background-paper border border-secondary-light rounded-lg"
        >
          <PromptInputTextarea
            className="text-text-primary"
            placeholder="Ask me anything you don't understand."
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar>
            <div></div>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  )
}
