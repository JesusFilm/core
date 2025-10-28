import { ArrowLeft, ArrowUp, Book, Check, Copy, Layers, User, X } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'

import { AutoResizeTextarea } from '@core/shared/uimodern/components/textarea'
import type { ConversationMap } from '../../libs/storage'
import { Button } from '../ui/button'

export type ConversationMapViewProps = {
  map: ConversationMap
}

export const ConversationMapView = memo(({ map }: ConversationMapViewProps) => {
  const [selectedScriptureOptions, setSelectedScriptureOptions] = useState<Record<number, string>>({})
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [localMessageContent, setLocalMessageContent] = useState<string>('')

  useEffect(() => {
    setSelectedScriptureOptions({})
    setCopiedMessageId(null)
    setEditingMessageId(null)
    setLocalMessageContent('')
  }, [map])

  const handleScriptureSelect = useCallback((stepIndex: number, verseId: string | null) => {
    setSelectedScriptureOptions((previousSelections) => {
      const nextSelections = { ...previousSelections }

      if (verseId) {
        nextSelections[stepIndex] = verseId
      } else {
        delete nextSelections[stepIndex]
      }

      return nextSelections
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
          const selectedScriptureOption = selectedScriptureOptions[index] ?? null
          const scriptureSlides = Array.isArray(step.scriptureOptions)
            ? step.scriptureOptions.reduce<
                {
                  optionIndex: number
                  verseId: string
                  verseDisplay: string
                  verseText: string
                  verseReference: string
                  hasVerseContent: boolean
                  hasWhy: boolean
                  whyText: string
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

                accumulator.push({
                  optionIndex,
                  verseId: `scripture-${index}-${optionIndex}`,
                  verseDisplay,
                  verseText,
                  verseReference,
                  hasVerseContent,
                  hasWhy,
                  whyText
                })

                return accumulator
              }, [])
            : []

          return (
            <section
              key={`step-${index}`}
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
                  <div
                    className={`space-y-3 overflow-hidden transition-all duration-500 ease-in-out ${
                      selectedScriptureOption
                        ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                        : 'max-h-[999px] opacity-100 translate-y-0'
                    }`}
                    aria-hidden={Boolean(selectedScriptureOption)}
                  >
                    <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                      <Book className="w-4 h-4 text-muted-foreground" />
                      Scripture Options
                    </div>

                    <div className="space-y-8">
                      <h3 className="text-lg font-semibold text-foreground">
                        Prayerfully select the bible verse to use
                      </h3>

                      {scriptureSlides.map((slide, slideIndex) => {
                        const isSelected = selectedScriptureOption === slide.verseId

                        return (
                          <div key={`scripture-option-${index}-${slide.optionIndex}`}>
                            <div className="flex w-full items-start gap-4">
                              <button
                                type="button"
                                onClick={() =>
                                  isSelected
                                    ? handleScriptureSelect(index, null)
                                    : handleScriptureSelect(index, slide.verseId)
                                }
                                className={`flex items-center justify-center w-5 h-5 mt-2 rounded-full cursor-pointer transition-all duration-200 flex-shrink-0 group/checkbox ${
                                  isSelected
                                    ? 'bg-primary border-2 border-primary text-primary-foreground hover:bg-red-500 hover:border-red-500 hover:text-white'
                                    : 'border-2 border-muted-foreground/40 hover:border-primary'
                                }`}
                                title={isSelected ? 'Reset selection' : 'Select verse'}
                              >
                                {isSelected ? (
                                  <div className="relative">
                                    <Check className="w-3 h-3 opacity-100 group-hover/checkbox:opacity-0 transition-opacity duration-200" />
                                    <X className="w-3 h-3 absolute inset-0 opacity-0 group-hover/checkbox:opacity-100 transition-opacity duration-200" />
                                  </div>
                                ) : null}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleScriptureSelect(index, slide.verseId)}
                                className={`flex-1 text-left cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary group ${
                                  isSelected
                                    ? 'rounded-2xl'
                                    : 'rounded-2xl border-2 border-transparent'
                                }`}
                                aria-pressed={isSelected}
                              >
                                <div className="flex w-full items-start gap-4">
                                  <div className="flex flex-1 flex-col lg:flex-row gap-2">
                                    {slide.hasVerseContent && (
                                      <div className="flex justify-start lg:flex-1">
                                        <div className="relative w-full max-w-[500px]">
                                          <div className="flex flex-col gap-2">
                                            <div className="text-lg font-semibold leading-[1.25] whitespace-pre-line text-foreground">
                                              {slide.verseText}
                                            </div>
                                            {slide.verseReference && (
                                              <div className="text-sm font-regular text-muted-foreground">
                                                {slide.verseReference}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {slide.hasWhy && (
                                      <div className="mt-2 lg:flex-1 lg:flex lg:items-start lg:justify-end">
                                        <p className="text-sm text-stone-500 leading-relaxed lg:max-w-[300px]">
                                          <ArrowUp className="inline w-3 h-3 mr-1 mb-0.5 md:hidden" />
                                          <ArrowLeft className="hidden w-3 h-3 mr-1 mb-0.5 md:inline" />
                                          {slide.whyText}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            </div>

                            {/* Horizontal divider between items */}
                            {slideIndex < scriptureSlides.length - 1 && (
                              <div className="w-full h-px bg-border my-4" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {selectedScriptureOption && (
                  <div className="space-y-3">
                    {scriptureSlides
                      .filter((slide) => slide.verseId === selectedScriptureOption)
                      .map((slide) => {
                        const scriptureMessageId = `scripture-message-${index}-${slide.optionIndex}`

                        return (
                          <div key={`selected-scripture-${slide.verseId}`} className="space-y-3">
                            <div className="flex items-center justify-start space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                                You selected
                              </span>
                            </div>
                            <div className="flex justify-start">
                              <div className="relative w-full max-w-[400px] rounded-2xl bg-[#098CFF] text-white shadow-xl group">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 gap-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent text-white"
                                  onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    void handleCopyMessage(
                                      slide.verseDisplay,
                                      scriptureMessageId
                                    )
                                  }}
                                  onMouseDown={(event) => event.preventDefault()}
                                  title={
                                    copiedMessageId === scriptureMessageId
                                      ? 'Copied!'
                                      : 'Copy verse'
                                  }
                                >
                                  {copiedMessageId === scriptureMessageId ? (
                                    <Check className="h-3 w-3 text-green-300" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                                <span
                                  aria-hidden="true"
                                  className="absolute left-3 -bottom-1 h-3 w-3 rotate-45 bg-[#098CFF]"
                                />
                                <AutoResizeTextarea
                                  value={
                                    editingMessageId === scriptureMessageId
                                      ? localMessageContent
                                      : slide.verseDisplay
                                  }
                                  onChange={(event) =>
                                    handleMessageChange(event.target.value)
                                  }
                                  onClick={() =>
                                    handleMessageClick(
                                      slide.verseDisplay,
                                      scriptureMessageId
                                    )
                                  }
                                  onBlur={handleMessageBlur}
                                  readOnly={
                                    editingMessageId !== scriptureMessageId
                                  }
                                  className="border-none shadow-none bg-transparent focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 px-4 py-3 rounded-2xl"
                                  data-message-id={scriptureMessageId}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-xs font-semibold text-muted-foreground"
                                onClick={() => handleScriptureSelect(index, null)}
                              >
                                Choose a different verse
                              </Button>
                            </div>
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
