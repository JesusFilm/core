import { memo, useCallback, useEffect, useState } from 'react'

import { Book, Bot, Check, Copy, Layers, User } from 'lucide-react'

import type { ConversationMap } from '../../libs/storage'
import { Button } from '../ui/button'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../ui/carousel'
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

  const rawFlowSequence = map.flow?.sequence
  const flowSequence = Array.isArray(rawFlowSequence)
    ? rawFlowSequence.map((movement) => movement.trim()).filter(Boolean)
    : []

  const flowRationale =
    typeof map.flow?.rationale === 'string' ? map.flow.rationale.trim() : ''

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
        {(flowSequence.length > 0 || flowRationale) && (
          <section className="relative pl-0 sm:pl-12" aria-label="Conversation flow overview">
            <div
              aria-hidden="true"
              className="hidden sm:block absolute left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-background bg-primary shadow"
            />
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary font-semibold">
                <Layers className="h-4 w-4" />
                Conversation Flow
              </div>
              {flowSequence.length ? (
                <div className="flex flex-wrap items-center gap-2 text-sm text-primary/90">
                  {flowSequence.map((movement, movementIndex) => (
                    <span key={`${movement}-${movementIndex}`} className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 font-medium capitalize text-primary">
                        {movement}
                      </span>
                      {movementIndex < flowSequence.length - 1 && (
                        <span aria-hidden className="text-primary/60">→</span>
                      )}
                    </span>
                  ))}
                </div>
              ) : null}
              {flowRationale && (
                <p className="text-sm text-primary/80 leading-relaxed">{flowRationale}</p>
              )}
            </div>
          </section>
        )}

        {map.steps.map((step, index) => {
          const stepKey = `step-${index}`
          const playedForStep = playedOptions[stepKey] ?? []
          const scriptureSlides = Array.isArray(step.scriptureOptions)
            ? step.scriptureOptions.reduce<
                {
                  optionIndex: number
                  verseId: string
                  verseDisplay: string
                  hasVerseContent: boolean
                  hasWhy: boolean
                  whyText: string
                  conversationExamples: { tone?: string; message: string }[]
                }[]
              >((accumulator, option, optionIndex) => {
                const text =
                  typeof option?.text === 'string' ? option.text.trim() : ''
                const reference =
                  typeof option?.reference === 'string'
                    ? option.reference.trim()
                    : ''
                const verseParts = [text, reference].filter(Boolean)
                const verseDisplay = verseParts.join('\n\n')
                const hasVerseContent = verseDisplay.length > 0

                const whyText =
                  typeof option?.whyItFits === 'string'
                    ? option.whyItFits.trim()
                    : ''
                const hasWhy = whyText.length > 0

                const conversationExamples = Array.isArray(
                  option?.conversationExamples
                )
                  ? option.conversationExamples.reduce<
                      { tone?: string; message: string }[]
                    >((examplesAccumulator, example) => {
                      const message =
                        typeof example?.message === 'string'
                          ? example.message.trim()
                          : ''

                      if (!message) {
                        return examplesAccumulator
                      }

                      examplesAccumulator.push({
                        ...example,
                        message
                      })

                      return examplesAccumulator
                    }, [])
                  : []
                const hasExamples = conversationExamples.length > 0

                if (!hasVerseContent && !hasWhy && !hasExamples) {
                  return accumulator
                }

                accumulator.push({
                  optionIndex,
                  verseId: `scripture-${index}-${optionIndex}`,
                  verseDisplay,
                  hasVerseContent,
                  hasWhy,
                  whyText,
                  conversationExamples
                })

                return accumulator
              }, [])
            : []

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

              <div className="space-y-6">
                {scriptureSlides.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                      <Book className="w-4 h-4 text-muted-foreground" />
                      Scripture Options
                    </div>

                    <Carousel
                      className="relative w-full"
                      opts={{ align: 'start', containScroll: 'trimSnaps' }}
                      aria-label={`Scripture options for ${step.title}`}
                    >
                      <CarouselContent className="pb-8">
                        {scriptureSlides.map((slide) => {
                          const exampleBaseId = `scripture-example-${index}-${slide.optionIndex}`

                          return (
                            <CarouselItem
                              key={`scripture-option-${index}-${slide.optionIndex}`}
                              className="flex"
                            >
                              <div className="flex w-full flex-col gap-4 pr-4">
                                {slide.hasVerseContent && (
                                  <div className="flex justify-start">
                                    <div className="relative w-full max-w-[400px] rounded-2xl bg-amber-100 text-amber-900 shadow-xl">
                                      <span
                                        aria-hidden="true"
                                        className="absolute left-3 -bottom-1 h-3 w-3 rotate-45 bg-amber-100"
                                      />
                                      <AutoResizeTextarea
                                        value={
                                          editingMessageId === slide.verseId
                                            ? localMessageContent
                                            : slide.verseDisplay
                                        }
                                        onChange={(event) =>
                                          handleMessageChange(event.target.value)
                                        }
                                        onClick={() =>
                                          handleMessageClick(
                                            slide.verseDisplay,
                                            slide.verseId
                                          )
                                        }
                                        onBlur={handleMessageBlur}
                                        readOnly={editingMessageId !== slide.verseId}
                                        className="border-none shadow-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 text-sm leading-relaxed whitespace-pre-line"
                                        data-message-id={slide.verseId}
                                      />
                                    </div>
                                  </div>
                                )}

                                {slide.hasWhy && (
                                  <p className="text-sm text-amber-900/90 leading-relaxed">
                                    {slide.whyText}
                                  </p>
                                )}

                                {slide.conversationExamples.length > 0 && (
                                  <div className="space-y-2">
                                    <span className="text-xs uppercase font-semibold tracking-wide text-amber-900/70">
                                      Conversation Examples
                                    </span>
                                    <div className="space-y-2">
                                      {slide.conversationExamples.map(
                                        (example, exampleIndex) => {
                                          const exampleId = `${exampleBaseId}-${exampleIndex}`

                                          return (
                                            <div
                                              key={exampleId}
                                              className="relative rounded-2xl border border-amber-200/70 bg-white p-3 shadow group"
                                            >
                                              <div className="mb-2 flex items-center justify-between gap-2">
                                                <span className="text-xs uppercase font-semibold tracking-wide text-amber-900/80">
                                                  {example.tone || 'Example'}
                                                </span>
                                                <Button
                                                  type="button"
                                                  variant="transparent"
                                                  size="sm"
                                                  className="h-6 w-6 gap-1 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                  onClick={(event) => {
                                                    event.preventDefault()
                                                    event.stopPropagation()
                                                    void handleCopyMessage(
                                                      example.message,
                                                      exampleId
                                                    )
                                                  }}
                                                  onMouseDown={(event) =>
                                                    event.preventDefault()
                                                  }
                                                  title={
                                                    copiedMessageId === exampleId
                                                      ? 'Copied!'
                                                      : 'Copy message'
                                                  }
                                                >
                                                  {copiedMessageId === exampleId ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                  ) : (
                                                    <Copy className="h-3 w-3" />
                                                  )}
                                                </Button>
                                              </div>
                                              <AutoResizeTextarea
                                                value={
                                                  editingMessageId === exampleId
                                                    ? localMessageContent
                                                    : example.message
                                                }
                                                onChange={(event) =>
                                                  handleMessageChange(
                                                    event.target.value
                                                  )
                                                }
                                                onClick={() =>
                                                  handleMessageClick(
                                                    example.message,
                                                    exampleId
                                                  )
                                                }
                                                onBlur={handleMessageBlur}
                                                readOnly={
                                                  editingMessageId !== exampleId
                                                }
                                                className="border-none shadow-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 text-sm leading-relaxed"
                                                data-message-id={exampleId}
                                              />
                                            </div>
                                          )
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CarouselItem>
                          )
                        })}
                      </CarouselContent>
                      {scriptureSlides.length > 1 && (
                        <>
                          <CarouselPrevious className="-left-8 top-1/2 -translate-y-1/2" />
                          <CarouselNext className="-right-8 top-1/2 -translate-y-1/2" />
                        </>
                      )}
                    </Carousel>
                  </div>
                ) : null}

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
