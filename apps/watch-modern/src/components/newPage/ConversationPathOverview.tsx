import { Layers } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

export type ConversationPathOverviewProps = {
  sequence: string[]
  rationale?: ReactNode
  className?: string
}

// Static class mappings for Tailwind JIT compiler
const SCALE_CLASSES: Record<number, string> = {
  60: 'scale-[0.6]',
  65: 'scale-[0.65]',
  70: 'scale-[0.7]',
  75: 'scale-[0.75]',
  80: 'scale-[0.8]',
  85: 'scale-[0.85]',
  90: 'scale-[0.9]',
  95: 'scale-[0.95]',
  100: 'scale-100'
}

// Custom margin spacing for each element position
const getMarginBottomPixels = (index: number): number => {
  const marginMap: Record<number, number> = {
    0: -8,
    1: 0,
    2: 8,
    3: 14
  }
  return marginMap[index] ?? 14 // default to 14px for any additional elements
}

export function ConversationPathOverview({
  sequence,
  rationale,
  className
}: ConversationPathOverviewProps): JSX.Element | null {
  const normalizedSequence = Array.isArray(sequence)
    ? sequence.map((movement) => movement.trim()).filter(Boolean)
    : []

  const reversedSequence = normalizedSequence.length
    ? [...normalizedSequence].reverse()
    : []

  const hasSequence = normalizedSequence.length > 0
  const hasRationale = Boolean(
    (typeof rationale === 'string' ? rationale.trim() : rationale)
  )

  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())

  const handleStepClick = useCallback((bubbleIndex: number) => {
    // Calculate which step section this bubble corresponds to
    // Bubbles are in reverse order, so bubble 0 = last step, bubble 1 = second to last, etc.
    const targetStepIndex = reversedSequence.length - 1 - bubbleIndex

    // Find the corresponding step section element
    const stepSection = document.querySelector(`[aria-label*="Step ${targetStepIndex + 1}:"]`)

    if (stepSection) {
      stepSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [reversedSequence.length])

  // Animation effect for steps - runs only on first render
  useEffect(() => {
    if (!hasSequence) return

    setVisibleSteps(new Set())
    const timeouts: NodeJS.Timeout[] = []

    // Animate steps in reverse order (last step first)
    for (let i = reversedSequence.length - 1; i >= 0; i--) {
      const stepIndex = i
      const animationDelay = (reversedSequence.length - 1 - i) * 800

      const timeout = setTimeout(() => {
        setVisibleSteps(prev => new Set(Array.from(prev).concat(stepIndex)))
      }, animationDelay)

      timeouts.push(timeout)
    }

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  if (!hasSequence && !hasRationale) return null

  return (
    <section
      className={`relative pl-0 mb-20 ${className ?? ''}`.trim()}
      aria-label="Conversation flow overview"
    >
      
      <div className="rounded-3xl border-2 p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {hasSequence ? (
            <div className="flex-1">
              {!hasRationale ? (
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Layers className="h-4 w-4" />
                  Conversation Path
                </div>
              ) : null}
              <div className="relative">
                <ol className="relative flex flex-col items-center -mt-10 -mb-14">
                  {reversedSequence.map((movement, index) => {
                    // Calculate scale for perspective effect - bottom step largest, top step smallest
                    // Calculate scale: top item (index 0) = 60%, bottom item (last index) = 100%
                    const progress = index / Math.max(1, reversedSequence.length - 1) // 0 to 1
                    const scaleValue = 60 + progress * 40 // 60% to 100%
                    const roundedScale = Math.round(scaleValue / 5) * 5 as keyof typeof SCALE_CLASSES
                    const scaleClass = SCALE_CLASSES[roundedScale] || SCALE_CLASSES[100]

                    // Apply custom margin spacing based on element position
                    const marginBottomPixels = getMarginBottomPixels(index)

                    return (
                      <li
                        key={`${movement}-${index}`}
                        className="relative z-10 flex w-full max-w-[18rem] justify-center"
                        style={{ marginBottom: `${marginBottomPixels}px` }}
                      >
                        <div
                          className={`relative inline-flex w-full justify-start items-center message-bubble px-4 py-3 text-sm font-semibold capitalize text-primary shadow-2xl transition-all duration-1000 ease-in-out origin-center cursor-pointer hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            visibleSteps.has(index)
                              ? `translate-y-0 opacity-100 levitate ${scaleClass}`
                              : 'translate-y-8 opacity-0'
                          }`}
                          onClick={() => handleStepClick(index)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              handleStepClick(index)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Scroll to Step ${reversedSequence.length - index}`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                              {reversedSequence.length - index}
                            </span>
                            <span className="relative">{movement}</span>
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          ) : null}
          {hasRationale ? (
            <div className="flex-1 lg:pl-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Layers className="h-4 w-4" />
                Conversation Path
              </div>
              <div className="mt-3 text-base leading-relaxed text-stone-600">
                {rationale}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
