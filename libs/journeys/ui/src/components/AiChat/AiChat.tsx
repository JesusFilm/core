import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { getAuth } from 'firebase/auth'
import { CopyIcon, Loader, RefreshCcwIcon } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { Fragment, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock, useBlocks } from '../../libs/block'
import { firebaseClient } from '../../libs/firebaseClient'
import { useJourney } from '../../libs/JourneyProvider'
import { Action, Actions } from '../Actions'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '../Conversation'
import { Message, MessageContent } from '../Message'
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar
} from '../PromptInput'
import { Response } from '../Response'
import { Suggestion, Suggestions } from '../Suggestion'

import { extractBlockContext } from './utils/contextExtraction'

interface AiChatProps {
  open: boolean
}

export function AiChat({ open }: AiChatProps) {
  const { t } = useTranslation('apps-journeys')
  const auth = getAuth(firebaseClient)
  const user = auth.currentUser
  const { journey } = useJourney()
  const traceId = useRef<string | null>(null)
  const sessionId = useRef<string | null>(null)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>()
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)
  const { blockHistory } = useBlocks()
  const [contextText, setContextText] = useState<string>('')

  useEffect(() => {
    sessionId.current = uuidv4()
  }, [])

  const { messages, sendMessage, status, regenerate, id } = useChat({
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

  const activeBlock = blockHistory.at(-1)

  async function fetchSuggestions() {
    setSuggestionsLoading(true)
    setSuggestionsError(null)

    try {
      const contextText = extractBlockContext(activeBlock as TreeBlock)
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
      setContextText(contextText)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestionsError(t('Failed to load suggestions'))
      setSuggestions([])
    } finally {
      setSuggestionsLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return

    void fetchSuggestions()
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) {
      void sendMessage(
        { text: input },
        {
          body: {
            contextText,
            chatId: id,
            sessionId: sessionId.current,
            traceId: traceId.current,
            journeyId: journey?.id,
            userId: user?.uid
          }
        }
      )
      setInput('')
    }
  }

  function handleSuggestionClick(suggestion: string) {
    void sendMessage(
      { text: suggestion },
      {
        body: {
          contextText,
          chatId: id,
          sessionId: sessionId.current,
          traceId: traceId.current,
          journeyId: journey?.id,
          userId: user?.uid
        }
      }
    )
  }

  return (
    <div className="flex flex-col h-full p-2">
      <Conversation className="flex-1 min-h-0 overflow-hidden">
        <ConversationContent className="h-full overflow-y-auto">
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
      <div className="flex-shrink-0">
        <Suggestions className="p-4">
          {suggestionsLoading && (
            <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
              <Loader className="size-4 animate-spin" />
              <span>{t('Loading suggestions, please hold...')}</span>
            </div>
          )}
          {suggestionsError && (
            <div className="px-4 py-2 text-destructive">{suggestionsError}</div>
          )}
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
          className="w-full bg-background-paper border border-secondary-light rounded-lg"
        >
          <PromptInputTextarea
            className="text-text-primary flex-1 text-md "
            placeholder={t("Ask me anything you don't understand.")}
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
