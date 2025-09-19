import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { getAuth } from 'firebase/auth'
import {
  CopyIcon,
  Loader,
  RefreshCcwIcon,
  SendHorizonalIcon
} from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { Fragment, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useBlocks } from '../../libs/block'
import { firebaseClient } from '../../libs/firebaseClient'
import { useJourney } from '../../libs/JourneyProvider'
import { useJourneyAiContext } from '../../libs/JourneyAiContextProvider'
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
  PromptInputTextarea
} from '../PromptInput'
import type { PromptInputMessage } from '../PromptInput/PromptInput'
import { Response } from '../Response'
import { Suggestion, Suggestions } from '../Suggestion'

interface AiChatProps {
  open: boolean
}

export function AiChat({ open }: AiChatProps) {
  const { t } = useTranslation('libs-journeys-ui')
  const auth = getAuth(firebaseClient)
  const user = auth.currentUser
  const { journey } = useJourney()
  const {
    data: aiContextData,
    isLoading: contextLoading,
    error: contextError
  } = useJourneyAiContext()
  const traceId = useRef<string | null>(null)
  const sessionId = useRef<string | null>(null)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>()
  const { blockHistory } = useBlocks()
  const [contextText, setContextText] = useState<string>('')
  const [contextLanguage, setContextLanguage] = useState<string>('')

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

  function setContexts() {
    // Find context data for the active block from the provider
    const activeBlockContext = aiContextData.find(
      (context) => context.blockId === activeBlock?.id
    )
    if (
      !activeBlockContext?.contextText ||
      activeBlockContext.contextText === ''
    ) {
      setSuggestions([])
      return
    }

    setSuggestions(activeBlockContext.suggestions)
    setContextText(activeBlockContext.contextText)
    setContextLanguage(activeBlockContext.language || 'english')
  }

  useEffect(() => {
    if (!open) return

    setContexts()
  }, [open, aiContextData, activeBlock])

  function handleSubmit(
    message: PromptInputMessage,
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    if (message.text?.trim()) {
      void sendMessage(
        { text: message.text },
        {
          body: {
            contextText,
            language: contextLanguage,
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
          language: contextLanguage,
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
    <div className="flex flex-col h-full min-h-0">
      <Conversation className="h-full">
        <ConversationContent>
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
      <div className="border-t border-border">
        <Suggestions className="px-4 py-2">
          {contextLoading && (
            <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
              <Loader className="size-4 animate-spin" />
              <span>{t('Loading suggestions, please wait...')}</span>
            </div>
          )}
          {contextError && (
            <div className="flex flex-col gap-2 px-4 py-2">
              <div className="text-destructive text-sm">
                {t('Failed to load suggestions')}
              </div>
            </div>
          )}
          {!contextLoading &&
            !contextError &&
            suggestions?.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
        </Suggestions>
      </div>
      <div className="px-4 pb-4">
        <PromptInput
          onSubmit={handleSubmit}
          className="w-full bg-background-paper border-none rounded-xl bg-[#EFEFEF] p-0 flex flex-row"
        >
          <PromptInputTextarea
            className="text-foreground"
            placeholder={t('Ask me anything')}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <div className="flex flex-row justify-end self-end">
            <PromptInputSubmit
              disabled={!input}
              status={status}
              className="bg-transparent hover:bg-transparent border-none shadow-none text-[#6D6D6D]"
              children={<SendHorizonalIcon className="size-5" />}
            />
          </div>
        </PromptInput>
      </div>
    </div>
  )
}
