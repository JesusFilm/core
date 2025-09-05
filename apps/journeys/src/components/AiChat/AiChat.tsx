import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { Fragment, useState } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '../Conversation'
import { Message as MessageComponent, MessageContent } from '../Message'
import { Response } from '../Response'
import { Action, Actions } from '../Actions'
import { CopyIcon, Loader, RefreshCcwIcon } from 'lucide-react'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../Reasoning'
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools
} from '../PromptInput'

export function AiChat() {
  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    })
  })
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage({ text: input })
      setInput('')
    }
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
                          <MessageComponent from={message.role}>
                            <MessageContent>
                              <div>{part.text}</div>
                            </MessageContent>
                          </MessageComponent>
                          {message.role === 'assistant' &&
                            i === messages.length - 1 && (
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
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === 'streaming' &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
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
        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4 bg-background-paper border border-secondary-light rounded-lg"
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
