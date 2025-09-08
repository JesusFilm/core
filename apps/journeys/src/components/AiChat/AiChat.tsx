import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useEffect, Fragment, useState } from 'react'
import { SuggestionsRequest } from '../../types/suggestions'
import { useBlocks } from '@core/journeys/ui/block'
import { extractTypographyContent } from '../../utils/contextExtraction'

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '../Conversation'
import { Message, MessageContent } from '../Message'
import { Response } from '../Response'
import { Action, Actions } from '../Actions'
import { CopyIcon, Loader, RefreshCcwIcon } from 'lucide-react'
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar
} from '../PromptInput'
import { Suggestion, Suggestions } from '../Suggestion'

interface AiChatProps {
  open: boolean
}

export function AiChat({ open }: AiChatProps) {
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
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const { treeBlocks, blockHistory } = useBlocks()

  // Fetch suggestions when the chat opens
  useEffect(() => {
    if (!open) return
    const activeBlock = blockHistory.at(-1)
    if (!activeBlock) {
      console.log('No blocks found for suggestions')
      setSuggestions([])
      return
    }

    let isCancelled = false

    const fetchSuggestions = async () => {
      setSuggestionsLoading(true)
      setSuggestionsError(null)

      try {
        const contextText = extractTypographyContent(activeBlock)
        if (!contextText) {
          console.log('No suggestions generated')
          setSuggestions([])
          return
        }

        const requestBody: SuggestionsRequest = { contextText }
        const response = await fetch('/api/chat/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) throw new Error('Failed to fetch suggestions')

        const suggestions: string[] = await response.json()

        if (!isCancelled) setSuggestions(suggestions)
      } catch (error) {
        if (isCancelled) return
        console.error('Error fetching suggestions:', error)
        setSuggestionsError('Failed to load suggestions')
        setSuggestions([])
      } finally {
        if (!isCancelled) setSuggestionsLoading(false)
      }
    }

    fetchSuggestions()
    return () => {
      isCancelled = true
    }
  }, [open, treeBlocks])

  // Prototype visibility
  useEffect(() => {
    suggestions?.forEach((element) => {
      console.log('Suggestion: ', element)
    })
  }, [suggestions])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) {
      sendMessage({ text: input })
      setInput('')
    }
  }

  function handleSuggestionClick(suggestion: string) {
    sendMessage({ text: suggestion })
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
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </Action>
                                <Action
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
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
