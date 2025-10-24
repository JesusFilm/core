import { ArrowUp, Book, Bot, Check, Copy, Layers, User } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'

import type { ConversationMap, ConversationMapResponseOption } from '../../libs/storage'
import { Button } from '../ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'

import { AutoResizeTextarea } from '@/components/ui/textarea'

export type ConversationMapViewProps = {
  map: ConversationMap
}

type ReactionPreset = {
  idSuffix: string
  icon: string
  label: string
  fallbackMessage: string
}

const PREDEFINED_RESPONSE_REACTIONS: ReactionPreset[] = [
  {
    idSuffix: 'feeling-hurt',
    icon: '😡',
    label: 'Feeling hurt',
    fallbackMessage: "This really upsets me. I don't think I can accept this."
  },
  {
    idSuffix: 'uneasy',
    icon: '🫤',
    label: 'Uneasy',
    fallbackMessage: "I'm not convinced this is the right direction."
  },
  {
    idSuffix: 'processing',
    icon: '😐',
    label: 'Processing',
    fallbackMessage: "Okay... I'm hearing you, I'm just not sure what to do with this yet."
  },
  {
    idSuffix: 'curious',
    icon: '😏',
    label: 'Curious',
    fallbackMessage: "Huh, that's interesting. Maybe there's more here for me to explore."
  },
  {
    idSuffix: 'encouraged',
    icon: '🙂',
    label: 'Encouraged',
    fallbackMessage: 'Thanks—that actually gives me some hope.'
  }
]

const sanitizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const buildReactionOptions = (
  step: ConversationMap['steps'][number],
  stepKey: string
): ConversationMapResponseOption[] => {
  return PREDEFINED_RESPONSE_REACTIONS.map((reaction, reactionIndex) => {
    const sourceOption = step.responseOptions?.[reactionIndex]

    const responderMessage =
      sanitizeString(sourceOption?.responderMessage) ||
      sanitizeString(sourceOption?.label) ||
      reaction.fallbackMessage

    const guideFollowUps = (sourceOption?.guideFollowUps ?? [])
      .map((followUp) => sanitizeString(followUp))
      .filter((followUp): followUp is string => followUp.length > 0)

    return {
      id: `${stepKey}-${reaction.idSuffix}`,
      label: reaction.label,
      icon: reaction.icon,
      responderMessage,
      guideFollowUps
    }
  })
}

export const ConversationMapView = memo(({ map }: ConversationMapViewProps) => {
  const [playedOptions, setPlayedOptions] = useState<Record<string, string[]>>({})
  const [reactionSelections, setReactionSelections] = useState<Record<string, number | null>>({})
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [localMessageContent, setLocalMessageContent] = useState<string>('')

  useEffect(() => {
    setPlayedOptions({})
    setReactionSelections({})
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
                Conversation Path
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
          const stepSelection = reactionSelections[stepKey] ?? null
          const reactionOptions = buildReactionOptions(step, stepKey)
          const sliderSpan = Math.max(reactionOptions.length - 1, 1)
          const scriptureSlides = Array.isArray(step.scriptureOptions)
            ? step.scriptureOptions.reduce<
                {
                  optionIndex: number
                  verseDisplay: string
                  verseText: string
                  verseReference: string
                  hasVerseContent: boolean
                  hasWhy: boolean
                  whyText: string
                  verseCopyText: string
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
                const verseText = text
                const verseReference = reference

                const whyText =
                  typeof option?.whyItFits === 'string'
                    ? option.whyItFits.trim()
                    : ''
                const hasWhy = whyText.length > 0

                if (!hasVerseContent && !hasWhy) {
                  return accumulator
                }

                const verseCopyText = [verseText, verseReference]
                  .filter(Boolean)
                  .join('\n\n')

                  accumulator.push({
                    optionIndex,
                    verseDisplay,
                  verseText,
                  verseReference,
                  hasVerseContent,
                  hasWhy,
                  whyText,
                  verseCopyText
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
                <div className="text-md leading-tight uppercase tracking-wide text-muted-foreground">
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
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="relative w-full max-w-[400px] rounded-2xl bg-[#098CFF] text-white shadow-xl group">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 gap-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent text-white"
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

                {scriptureSlides.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                      <Book className="w-4 h-4 text-muted-foreground" />
                      Scripture Options
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Prayerfully select the bible verse to use
                      </h3>

                      <Carousel
                        opts={{ align: 'center', skipSnaps: false }}
                        className="group/scripture-carousel"
                      >
                        <CarouselContent className="-ml-2">
                          {scriptureSlides.map((slide) => {
                            const verseMessageId = `scripture-${index}-${slide.optionIndex}`

                            return (
                              <CarouselItem
                                key={`scripture-option-${index}-${slide.optionIndex}`}
                                className="pl-2 pr-2 basis-full"
                              >
                                <div className="flex h-full flex-col items-end gap-3">
                                  <div className="relative w-full max-w-[400px] rounded-2xl bg-[#098CFF] text-white shadow-xl group">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-2 right-2 gap-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent text-white"
                                      onClick={(event) => {
                                        event.preventDefault()
                                        event.stopPropagation()
                                        void handleCopyMessage(slide.verseCopyText, verseMessageId)
                                      }}
                                      onMouseDown={(event) => event.preventDefault()}
                                      title={
                                        copiedMessageId === verseMessageId
                                          ? 'Copied!'
                                          : 'Copy message'
                                      }
                                    >
                                      {copiedMessageId === verseMessageId ? (
                                        <Check className="h-3 w-3 text-green-300" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <span
                                      aria-hidden="true"
                                      className="absolute right-3 -bottom-1 h-3 w-3 rotate-45 bg-[#098CFF]"
                                    />
                                    <div className="px-4 py-4 text-left text-sm leading-relaxed">
                                      <p className="whitespace-pre-line text-base font-medium leading-relaxed">
                                        {slide.verseText || slide.verseDisplay}
                                      </p>
                                      {slide.verseReference && (
                                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">
                                          {slide.verseReference}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {slide.hasWhy ? (
                                    <div className="ml-auto flex max-w-[400px] items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                                      <ArrowUp className="mt-1 h-4 w-4" />
                                      <p className="flex-1">{slide.whyText}</p>
                                    </div>
                                  ) : null}
                                </div>
                              </CarouselItem>
                            )
                          })}
                        </CarouselContent>
                        <CarouselPrevious className="flex" />
                        <CarouselNext className="flex" />
                      </Carousel>
                    </div>
                  </div>
                ) : null}

                {reactionOptions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Common responses
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Drag or tap a reaction to preview a reply
                      </span>
                    </div>

                    <div className="space-y-6" aria-label="Responder options slider">
                      <div className="relative px-2">
                        <div className="absolute left-2 right-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" aria-hidden />
                        {reactionOptions.length > 1 && (
                          <div
                            className="absolute left-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(
                                  100,
                                  ((stepSelection ?? 0) / sliderSpan) * 100
                                )
                              )}%`
                            }}
                            aria-hidden
                          />
                        )}
                        <input
                          type="range"
                          min={0}
                          max={reactionOptions.length - 1}
                          step={1}
                          value={stepSelection ?? 0}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value)
                            const option = reactionOptions[nextValue]
                            if (!option) return
                            setReactionSelections((previous) => ({
                              ...previous,
                              [stepKey]: nextValue
                            }))
                            handleOptionSelect(index, option.id)
                          }}
                          className="relative z-10 w-full appearance-none bg-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:shadow"
                          aria-valuenow={stepSelection ?? 0}
                          aria-valuemin={0}
                          aria-valuemax={reactionOptions.length - 1}
                          aria-valuetext={
                            reactionOptions[stepSelection ?? 0]?.label ?? ''
                          }
                        />
                        {reactionOptions.map((option, optionIndex) => {
                          const offsetPercent = (optionIndex / sliderSpan) * 100
                          const isSelected = stepSelection === optionIndex
                          const isPlayed = playedForStep.includes(option.id)

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setReactionSelections((previous) => ({
                                  ...previous,
                                  [stepKey]: optionIndex
                                }))
                                handleOptionSelect(index, option.id)
                              }}
                              className={`absolute top-1/2 flex h-12 w-12 -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border text-2xl transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-110'
                                  : isPlayed
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-background border-border'
                              }`}
                              style={{ left: `calc(${offsetPercent}% + 8px)` }}
                              aria-label={`${option.label}${isPlayed ? ' (played)' : ''}`}
                              aria-pressed={isSelected}
                            >
                              <span aria-hidden>{option.icon}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {playedForStep.length > 0 && (
                  <div className="space-y-6" aria-live="polite">
                    {playedForStep.map((optionId) => {
                        const option = reactionOptions.find(
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
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 gap-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
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
