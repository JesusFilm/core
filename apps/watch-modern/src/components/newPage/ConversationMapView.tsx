import { ArrowLeft, ArrowUp, Book, Check, Copy, User, X } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'

import { AutoResizeTextarea } from '@core/shared/uimodern/components/textarea'
import type { ConversationMap } from '../../libs/storage'
import { Button } from '../ui/button'
import { ConversationPathOverview } from './ConversationPathOverview'

export type ConversationMapViewProps = {
  map: ConversationMap
}

export const ConversationMapView = memo(({ map }: ConversationMapViewProps) => {
  const [selectedScriptureOptions, setSelectedScriptureOptions] = useState<Record<number, string>>({})
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [localMessageContent, setLocalMessageContent] = useState<string>('')
  const [animatingScriptureId, setAnimatingScriptureId] = useState<string | null>(null)
  const [showMessageBubble, setShowMessageBubble] = useState<boolean>(false)

  // Animation constants
  const ANIMATION_DURATION = 300 // ms - bounce animation duration
  const ANIMATION_DELAY = 250 // ms - delay before hiding animating block
  const BOUNCE_DISTANCE = 300 // px - how far the block bounces down
  const BOUNCE_SCALE = 0.95 // scale factor during bounce
  const BOUNCE_TIMING = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' // bounce easing function
  const DISSOLVE_OPACITY = 0.3 // opacity for dissolving other blocks
  const DISSOLVE_DURATION = 100 // ms - dissolve transition duration
  const MESSAGE_FADE_DURATION = 500 // ms - message bubble fade duration
const MESSAGE_DELAY = 150 // ms - delay before message bubble appears

  useEffect(() => {
    setSelectedScriptureOptions({})
    setCopiedMessageId(null)
    setEditingMessageId(null)
    setLocalMessageContent('')
    setAnimatingScriptureId(null)
    setShowMessageBubble(false)
  }, [map])

  const handleScriptureSelect = useCallback((stepIndex: number, verseId: string | null) => {
    if (verseId) {
      // Start animation when selecting
      const scriptureId = `scripture-${stepIndex}-${verseId.split('-').pop()}`
      setAnimatingScriptureId(scriptureId)

      // After animation starts, update selection state and show message bubble
      setTimeout(() => {
        setSelectedScriptureOptions((previousSelections) => ({
          ...previousSelections,
          [stepIndex]: verseId
        }))
        setAnimatingScriptureId(null)

        // Show message bubble with bounce animation after dissolve completes
        setTimeout(() => {
          setShowMessageBubble(true)
        }, MESSAGE_DELAY + DISSOLVE_DURATION)
      }, ANIMATION_DELAY) // Wait for animation to complete
    } else {
      // When deselecting, just update state immediately
      setSelectedScriptureOptions((previousSelections) => {
        const nextSelections = { ...previousSelections }
        delete nextSelections[stepIndex]
        return nextSelections
      })
      setShowMessageBubble(false)
    }
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
    <div>
      <ConversationPathOverview sequence={flowSequence} rationale={flowRationale} />
      
      <h2 className="text-xl font-medium mb-10 text-center text-stone-400">Conversation Map</h2>
    <div className="relative">
      <div
        aria-hidden="true"
        className="hidden sm:block absolute left-4 top-2 bottom-0 w-px bg-border"
      />

                              

      <div className="space-y-10">

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

              <header className="relative mb-6 sm:mb-2">
                <div className="flex items-start gap-3">
                  <span className="hidden" aria-hidden />
                  <div className="relative w-full max-w-[400px] rounded-none bg-transparent p-0 text-amber-900 shadow-none ring-0">
                    <span aria-hidden className="hidden" />
                    <div className="space-y-3">
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-primary/90">
                        Step {index + 1}
                      </span>
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold leading-snug text-foreground md:text-xl">
                          {step.title}
                        </h3>
                        {step.purpose && (
                          <p className="whitespace-pre-line text-sm leading-relaxed text-amber-900/80 md:text-base">
                            {step.purpose}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute opacity-20 -bottom-25 left-[-500%] xs:left-[-5%] sm:left-[5%] md:left-[20%] lg:left-[35%]">
                  <img
                    src={`/arrow${(index % 4) + 1}.svg`}
                    alt=""
                    className="w-28 h-28"
                    aria-hidden="true"
                  />
                </div>
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
                        : 'max-h-[2999px] opacity-100 translate-y-0'
                    }`}
                    aria-hidden={Boolean(selectedScriptureOption)}
                  >
                    <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wide text-muted-foreground">
                      <Book className="w-4 h-4 text-muted-foreground" />
                      Scripture Options
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        Prayerfully select the bible verse to use
                      </h3>

                      <div className="columns-1 sm:columns-2 lg:columns-3 gap-[1.5rem] space-y-0">
                        {scriptureSlides.map((slide, slideIndex) => {
                          const isSelected = selectedScriptureOption === slide.verseId

                          const isAnimating = animatingScriptureId === slide.verseId
                          const hasActiveAnimation = animatingScriptureId !== null

                          return (
                            <div
                              key={`scripture-option-${index}-${slide.optionIndex}`}
                              className={`break-inside-avoid min-w-0 mb-6 transition-opacity duration-100 ${
                                hasActiveAnimation && !isAnimating ? `opacity-30 pointer-events-none` : 'opacity-100'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  isSelected
                                    ? handleScriptureSelect(index, null)
                                    : handleScriptureSelect(index, slide.verseId)
                                }
                                className={`group relative block w-full max-w-full p-8 box-border cursor-pointer overflow-hidden rounded-3xl border-2 text-left hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                                  isAnimating
                                    ? `bg-[#098CFF] text-white shadow-xl border-transparent transform translate-y-[300px] scale-95 pointer-events-none transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)`
                                    : isSelected
                                    ? 'bg-[#098CFF] text-white shadow-xl border-transparent'
                                    : 'border-border hover:border-transparent hover:-translate-y-1 hover:shadow-lg'
                                }`}
                                aria-pressed={isSelected}
                                aria-label={`Select scripture option ${slideIndex + 1}`}
                              >

                                <div className="space-y-4 min-w-0">
                                  {slide.hasVerseContent && (
                                    <div className="space-y-3">
                                      <p className={`text-lg font-medium leading-relaxed ${(isSelected || isAnimating) ? 'text-white' : 'text-stone-800'}`}>
                                        {slide.verseText}
                                      </p>
                                      {slide.verseReference && (
                                        <p className={`text-sm font-medium uppercase tracking-wide ${(isSelected || isAnimating) ? 'text-white' : 'text-stone-500'}`}>
                                          {slide.verseReference}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {slide.hasWhy && (
                                    <div className={`relative -rotate-[0.6deg] overflow-hidden pt-5 text-sm leading-relaxed border-t ${(isSelected || isAnimating) ? 'text-white border-white/20' : 'text-amber-900 border-stone-400/20'}`}>

                                      <div className={`flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] ${(isSelected || isAnimating) ? 'text-white' : 'text-amber-700'}`}>
                                         <ArrowUp className={`h-3.5 w-3.5 ${(isSelected || isAnimating) ? 'text-white' : 'text-amber-500'}`} />

                                      </div>
                                      <p className={`mt-3 text-sm leading-relaxed ${(isSelected || isAnimating) ? 'text-white' : 'text-amber-900'}`}>
                                        {slide.whyText}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {selectedScriptureOption && showMessageBubble && (
                  <div className={`space-y-3`}>
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
                            <div className="flex justify-end">
                              <div className="relative w-full max-w-[400px] rounded-2xl bg-[#098CFF] text-white shadow-xl group animate-in fade-in slide-in-from-top-4 duration-1000">
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
                                  className="absolute right-3 -bottom-1 h-3 w-3 rotate-45 bg-[#098CFF]"
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
    </div>
  )
})

ConversationMapView.displayName = 'ConversationMapView'

export default ConversationMapView
