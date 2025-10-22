import { memo, useCallback, useEffect, useState } from 'react'

import { Book, Bot, Check, Copy, User } from 'lucide-react'

import type { ConversationMap } from '../../libs/storage'
import { Button } from '../ui/button'
import { AutoResizeTextarea } from '@/components/ui/textarea'

export type ConversationMapViewProps = {
  map: ConversationMap
}

export const ConversationMapView = memo(({ map }: ConversationMapViewProps) => {
  const [playedOptions, setPlayedOptions] = useState<Record<string, string[]>>({})
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [localMessageContent, setLocalMessageContent] = useState<string>('')

  useEffect(() => {
    setPlayedOptions({})
    setCopiedMessageId(null)
    setEditingMessageId(null)
    setLocalMessageContent('')
  }, [map])

  const handleOptionSelect = useCallback((stepIndex: number, optionId: string) => {
    setPlayedOptions((previous) => {
      const stepKey = `step-${stepIndex}`
      const existing = previous[stepKey] ?? []
      if (existing.includes(optionId)) {
        return previous
      }

      return {
        ...previous,
        [stepKey]: [...existing, optionId]
      }
    })
  }, [])

  const handleCopyMessage = useCallback(
    async (content: string, messageId: string) => {
      try {
        if (typeof navigator !== 'undefined' && navigator?.clipboard) {
          await navigator.clipboard.writeText(content)
          setCopiedMessageId(messageId)
          setTimeout(() => setCopiedMessageId(null), 2000)
        } else {
          throw new Error('Clipboard API unavailable')
        }
      } catch (error) {
        console.error('Failed to copy message content:', error)
        console.warn(
          'Unable to copy content automatically. Please copy manually.'
        )
      }
    },
    []
  )

  const handleMessageClick = useCallback((content: string, messageId: string) => {
    setEditingMessageId(messageId)
    setLocalMessageContent(content)
  }, [])

  const handleMessageBlur = useCallback(() => {
    setEditingMessageId(null)
  }, [])

  const handleMessageChange = useCallback((value: string) => {
    setLocalMessageContent(value)
  }, [])

  const hasSteps = Array.isArray(map?.steps) && map.steps.length > 0

  if (!hasSteps) {
    return (
      <div className="text-sm text-muted-foreground border border-dashed border-border rounded-2xl p-6 bg-muted/40">
        The AI will map an ideal set of guide-led messages once you provide context above.
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="hidden sm:block absolute left-4 top-0 bottom-0 w-px bg-border"
      />

      <div className="space-y-10">
        {map.steps.map((step, index) => {
          const stepKey = `step-${index}`
          const playedForStep = playedOptions[stepKey] ?? []

          return (
            <section
              key={stepKey}
              className="relative pl-0 sm:pl-12"
              aria-label={`Step ${index + 1}: ${step.title}`}
            >
              <div
                aria-hidden="true"
                className="hidden sm:block absolute left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-background bg-primary shadow"
              />

              <header className="mb-4 space-y-1">
                <div className="text-md font-light leading-tight uppercase tracking-wide text-muted-foreground">
                  Step {index + 1}:<br />
                  <span className="text-xl text-foreground normal-case font-semibold">
                    {step.title}
                  </span>
                </div>
                {step.purpose && (
                  <p className="text-sm text-muted-foreground">{step.purpose}</p>
                )}
              </header>

              <div className="space-y-4">
                {step.scripture && (step.scripture.text || step.scripture.reference) && (
                  <div className="flex justify-start">
                    <div className="space-y-3  w-full">
                      <div className="relative w-full max-w-[400px] rounded-2xl bg-amber-100 text-amber-900 shadow-xl">
                        <span
                          aria-hidden="true"
                          className="absolute left-3 -bottom-1 h-3 w-3 rotate-45 bg-amber-100"
                        />
                        {step.scripture.text && (
                          <AutoResizeTextarea
                            value={
                              editingMessageId === `scripture-${index}`
                                ? localMessageContent
                                : `${step.scripture.text}${
                                    step.scripture.reference
                                      ? `\n\n${step.scripture.reference}`
                                      : ''
                                  }`
                            }
                            onChange={(event) =>
                              handleMessageChange(event.target.value)
                            }
                            onClick={() =>
                              handleMessageClick(
                                `${step.scripture.text}${
                                  step.scripture.reference
                                    ? `\n\n${step.scripture.reference}`
                                    : ''
                                }`,
                                `scripture-${index}`
                              )
                            }
                            onBlur={handleMessageBlur}
                            readOnly={editingMessageId !== `scripture-${index}`}
                            className="border-none shadow-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 text-sm leading-relaxed whitespace-pre-line"
                            data-message-id={`scripture-${index}`}
                          />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Book className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                          Scripture
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="relative w-full max-w-[400px] rounded-2xl bg-[#098CFF] text-white shadow-xl group">
                      <Button
                        type="button"
                        variant="transparent"
                        size="sm"
                        className="absolute top-2 right-2 gap-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          void handleCopyMessage(step.guideMessage, `guide-${index}`)
                        }}
                        onMouseDown={(event) => event.preventDefault()}
                        title={
                          copiedMessageId === `guide-${index}`
                            ? 'Copied!'
                            : 'Copy message'
                        }
                      >
                        {copiedMessageId === `guide-${index}` ? (
                          <Check className="h-3 w-3 text-green-300" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <span
                        aria-hidden="true"
                        className="absolute right-3 -bottom-1 h-3 w-3 rotate-45 bg-[#098CFF]"
                      />
                      <AutoResizeTextarea
                        value={
                          editingMessageId === `guide-${index}`
                            ? localMessageContent
                            : step.guideMessage
                        }
                        onChange={(event) =>
                          handleMessageChange(event.target.value)
                        }
                        onClick={() =>
                          handleMessageClick(step.guideMessage, `guide-${index}`)
                        }
                        onBlur={handleMessageBlur}
                        readOnly={editingMessageId !== `guide-${index}`}
                        className="border-none shadow-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 px-4 py-3 rounded-2xl"
                        data-message-id={`guide-${index}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                      You
                    </span>
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {step.responseOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Common responses
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Tap to preview how you might reply
                      </span>
                    </div>
                    <div
                      role="list"
                      className="flex flex-wrap gap-2"
                      aria-label="Responder options"
                    >
                      {step.responseOptions.map((option) => {
                        const isPlayed = playedForStep.includes(option.id)

                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="listitem"
                            onClick={() => handleOptionSelect(index, option.id)}
                            className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                              isPlayed
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-background border-border hover:bg-muted'
                            }`}
                            aria-pressed={isPlayed}
                            aria-label={`${option.label}${
                              isPlayed ? ' (played)' : ''
                            }`}
                          >
                            {option.icon && (
                              <span aria-hidden className="text-base leading-none">
                                {option.icon}
                              </span>
                            )}
                            <span>{option.label}</span>
                            {isPlayed && <Check className="h-4 w-4" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {playedForStep.length > 0 && (
                  <div className="space-y-6" aria-live="polite">
                    {playedForStep.map((optionId) => {
                      const option = step.responseOptions.find(
                        (item) => item.id === optionId
                      )
                      if (!option) return null

                      return (
                        <div key={option.id} className="space-y-3">
                          <div className="space-y-3">
                            <div className="flex justify-start">
                              <div className="relative w-1/2 rounded-2xl bg-white text-foreground px-4 py-3 shadow-xl">
                                <span
                                  aria-hidden="true"
                                  className="absolute left-3 -bottom-1 h-3 w-3 rotate-45 bg-white"
                                />
                                <p className="text-sm leading-relaxed whitespace-pre-line">
                                  {option.responderMessage}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Bot className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                                Chatmate
                              </span>
                            </div>
                          </div>

                          {option.guideFollowUps.map((followUp, followUpIndex) => (
                            <div
                              key={`${option.id}-follow-${followUpIndex}`}
                              className="space-y-3"
                            >
                              <div className="flex justify-end">
                                <div className="relative w-1/2 rounded-2xl bg-[#098CFF] text-white shadow-xl group">
                                  <Button
                                    type="button"
                                    variant="transparent"
                                    size="sm"
                                    className="absolute top-2 right-2 gap-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(event) => {
                                      event.preventDefault()
                                      event.stopPropagation()
                                      void handleCopyMessage(
                                        followUp,
                                        `followup-${option.id}-${followUpIndex}`
                                      )
                                    }}
                                    onMouseDown={(event) => event.preventDefault()}
                                    title={
                                      copiedMessageId ===
                                      `followup-${option.id}-${followUpIndex}`
                                        ? 'Copied!'
                                        : 'Copy message'
                                    }
                                  >
                                    {copiedMessageId ===
                                    `followup-${option.id}-${followUpIndex}` ? (
                                      <Check className="h-3 w-3 text-green-300" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <span
                                    aria-hidden="true"
                                    className="absolute right-3 -bottom-1 h-3 w-3 rotate-45 bg-[#098CFF]"
                                  />
                                  <AutoResizeTextarea
                                    value={
                                      editingMessageId ===
                                      `followup-${option.id}-${followUpIndex}`
                                        ? localMessageContent
                                        : followUp
                                    }
                                    onChange={(event) =>
                                      handleMessageChange(event.target.value)
                                    }
                                    onClick={() =>
                                      handleMessageClick(
                                        followUp,
                                        `followup-${option.id}-${followUpIndex}`
                                      )
                                    }
                                    onBlur={handleMessageBlur}
                                    readOnly={
                                      editingMessageId !==
                                      `followup-${option.id}-${followUpIndex}`
                                    }
                                    className="border-none shadow-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 px-4 py-3 rounded-2xl"
                                    data-message-id={`followup-${option.id}-${followUpIndex}`}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-end space-x-2">
                                <span className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                                  You
                                </span>
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
})

ConversationMapView.displayName = 'ConversationMapView'

export default ConversationMapView
