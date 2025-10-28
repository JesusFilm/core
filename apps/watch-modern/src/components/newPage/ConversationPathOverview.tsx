import { Layers } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

export type ConversationPathOverviewProps = {
  sequence: string[]
  rationale?: ReactNode
  className?: string
}

type ConnectionCoordinates = {
  x1: number
  y1: number
  x2: number
  y2: number
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

const PADDING_X_CLASSES: Record<number, string> = {
  0: '',
  1: 'px-4',
  2: 'px-8',
  3: 'px-12',
  4: 'px-16'
}

const MARGIN_BOTTOM_CLASSES: Record<number, string> = {
  0: '',
  1: 'mb-1',
  2: 'mb-2',
  3: 'mb-3',
  4: 'mb-4',
  5: 'mb-5',
  6: 'mb-6',
  7: 'mb-7',
  8: 'mb-8',
  9: 'mb-9',
  10: 'mb-10',
  11: 'mb-11',
  12: 'mb-12'
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
    typeof rationale === 'string' ? rationale.trim() : rationale
  )

  const containerRef = useRef<HTMLDivElement | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const numberCircleRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [connections, setConnections] = useState<ConnectionCoordinates[]>([])
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())
  const [animationsComplete, setAnimationsComplete] = useState(false)
  const [animatedLines, setAnimatedLines] = useState<Set<number>>(new Set())

  stepRefs.current = stepRefs.current.slice(0, reversedSequence.length)
  numberCircleRefs.current = numberCircleRefs.current.slice(
    0,
    reversedSequence.length
  )

  // Animation effect for steps - runs only on first render
  useEffect(() => {
    if (!hasSequence) return

    setVisibleSteps(new Set())
    setAnimationsComplete(false)
    setAnimatedLines(new Set())

    const timeouts: NodeJS.Timeout[] = []

    // Animate steps in reverse order (last step first)
    for (let i = reversedSequence.length - 1; i >= 0; i--) {
      const stepIndex = i
      const animationDelay = (reversedSequence.length - 1 - i) * 800

      const timeout = setTimeout(() => {
        setVisibleSteps((prev) => new Set(Array.from(prev).concat(stepIndex)))
      }, animationDelay)

      timeouts.push(timeout)
    }

    // Mark animations complete after the last step appears plus animation duration
    const lastStepDelay = (reversedSequence.length - 1) * 800
    const animationDuration = 1000
    const completeTimeout = setTimeout(() => {
      setAnimationsComplete(true)
    }, lastStepDelay + animationDuration)

    timeouts.push(completeTimeout)

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [])

  // Effect to trigger line drawing animations when bubble animations complete
  useEffect(() => {
    if (!animationsComplete || connections.length === 0) return

    const timeouts: NodeJS.Timeout[] = []

    // Start line animations from bottom to top (highest index to lowest)
    // Since connections are in order from top to bottom, we need to reverse this
    const connectionIndices = Array.from(
      { length: connections.length },
      (_, i) => i
    ).reverse()

    connectionIndices.forEach((connectionIndex, animationIndex) => {
      const animationDelay = animationIndex * 800 // Stagger each line by 800ms for smoother reveal
      const timeout = setTimeout(() => {
        setAnimatedLines((prev) => new Set([...prev, connectionIndex]))
      }, animationDelay)

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [animationsComplete, connections.length])

  // Update connections when animations are complete and when layout changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (
      !containerRef.current ||
      reversedSequence.length < 2 ||
      !animationsComplete
    ) {
      setConnections([])
      return
    }

    const updateConnections = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()

      const nextConnections = stepRefs.current
        .slice(0, -1)
        .map((step, index) => {
          const nextStep = stepRefs.current[index + 1]
          const circle = numberCircleRefs.current[index]
          const nextCircle = numberCircleRefs.current[index + 1]

          if (!step || !nextStep || !circle || !nextCircle) {
            return { x1: 0, y1: 0, x2: 0, y2: 0 }
          }

          const circleRect = circle.getBoundingClientRect()
          const nextCircleRect = nextCircle.getBoundingClientRect()
          const stepRect = step.getBoundingClientRect()
          const nextStepRect = nextStep.getBoundingClientRect()

          // Get center X of number circles, center Y of step bubbles
          const circleCenterX =
            circleRect.left + circleRect.width / 2 - containerRect.left
          const circleCenterY =
            stepRect.top + stepRect.height / 2 - containerRect.top

          const nextCircleCenterX =
            nextCircleRect.left + nextCircleRect.width / 2 - containerRect.left
          const nextCircleCenterY =
            nextStepRect.top + nextStepRect.height / 2 - containerRect.top

          return {
            x1: circleCenterX,
            y1: circleCenterY,
            x2: nextCircleCenterX,
            y2: nextCircleCenterY
          }
        })

      setConnections(nextConnections)
    }

    let animationFrame: number | null = null
    const scheduleUpdate = () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }

      animationFrame = window.requestAnimationFrame(updateConnections)
    }

    // Delay the initial calculation slightly to ensure animations are fully applied
    const initialDelay = setTimeout(() => {
      scheduleUpdate()

      const resizeObservers: ResizeObserver[] = []

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(scheduleUpdate)
        observer.observe(containerRef.current!)
        stepRefs.current.forEach((node) => {
          if (node) {
            observer.observe(node)
          }
        })
        numberCircleRefs.current.forEach((circle) => {
          if (circle) {
            observer.observe(circle)
          }
        })

        resizeObservers.push(observer)
      }

      window.addEventListener('resize', scheduleUpdate)

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }

        resizeObservers.forEach((observer) => observer.disconnect())
        window.removeEventListener('resize', scheduleUpdate)
      }
    }, 100)

    return () => {
      clearTimeout(initialDelay)
    }
  }, [reversedSequence.length, animationsComplete])

  if (!hasSequence && !hasRationale) return null

  return (
    <section
      className={`relative pl-0 sm:pl-12 ${className ?? ''}`.trim()}
      aria-label="Conversation flow overview"
    >
      <div
        aria-hidden="true"
        className="hidden sm:block absolute left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-background bg-primary shadow"
      />
      <div className="rounded-3xl border border-primary/25 bg-primary/5 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          {hasSequence ? (
            <div className="flex-1">
              {!hasRationale ? (
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Layers className="h-4 w-4" />
                  Conversation Path
                </div>
              ) : null}
              <div ref={containerRef} className="relative">
                {connections.length > 0 ? (
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full text-primary/40"
                    fill="none"
                    aria-hidden
                  >
                    {connections.map(({ x1, y1, x2, y2 }, index) => {
                      // Check if both connected bubbles are visible (prerequisite for animation)
                      const bubblesVisible =
                        visibleSteps.has(index) && visibleSteps.has(index + 1)
                      const shouldAnimate = animatedLines.has(index)
                      return (
                        <line
                          key={`connection-${index}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth={2}
                          className={`${shouldAnimate ? 'reveal-line' : 'opacity-0'}`}
                          style={{
                            visibility: bubblesVisible ? 'visible' : 'hidden'
                          }}
                        />
                      )
                    })}
                  </svg>
                ) : null}
                <ol className="relative flex flex-col">
                  {reversedSequence.map((movement, index) => {
                    // Calculate scale for perspective effect - bottom step largest, top step smallest
                    // Calculate scale: top item (index 0) = 60%, bottom item (last index) = 100%
                    const progress =
                      index / Math.max(1, reversedSequence.length - 1) // 0 to 1
                    const scaleValue = 60 + progress * 40 // 60% to 100%
                    const roundedScale = (Math.round(scaleValue / 5) *
                      5) as keyof typeof SCALE_CLASSES
                    const scaleClass =
                      SCALE_CLASSES[roundedScale] || SCALE_CLASSES[100]

                    // Calculate decreasing horizontal margin for each step (top has most, bottom has none)
                    const horizontalPaddingIndex = Math.min(
                      reversedSequence.length - 1 - index,
                      4
                    ) as keyof typeof PADDING_X_CLASSES
                    const paddingClass =
                      PADDING_X_CLASSES[horizontalPaddingIndex] || ''

                    // Calculate increasing vertical spacing from top to bottom with scale compensation
                    const baseSpacingValue = index
                    const scaleCompensation = Math.round(
                      ((scaleValue - 60) / 40) * 3
                    )
                    const totalVerticalSpacing = Math.min(
                      baseSpacingValue + scaleCompensation,
                      12
                    ) as keyof typeof MARGIN_BOTTOM_CLASSES
                    const marginClass =
                      MARGIN_BOTTOM_CLASSES[totalVerticalSpacing] || ''

                    const tailClass =
                      index % 2 === 0
                        ? 'message-bubble-tail-right'
                        : 'message-bubble-tail-left'
                    const positionClass =
                      index % 2 === 0 ? 'self-start' : 'self-end'

                    return (
                      <li
                        key={`${movement}-${index}`}
                        className={`relative z-10 ${positionClass} ${paddingClass} ${marginClass}`}
                      >
                        <div
                          ref={(element) => {
                            stepRefs.current[index] = element
                          }}
                          className={`relative inline-flex w-[16rem] items-center message-bubble ${tailClass} px-4 py-3 text-sm font-semibold capitalize text-primary shadow-2xl transition-all duration-1000 ease-in-out origin-center ${
                            visibleSteps.has(index)
                              ? `translate-y-0 opacity-100 levitate ${scaleClass}`
                              : 'translate-y-8 opacity-0'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              ref={(element) => {
                                numberCircleRefs.current[index] = element
                              }}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                            >
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
            <div className="flex-1 lg:pl-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Layers className="h-4 w-4" />
                Conversation Path
              </div>
              <div className="mt-3 text-sm leading-relaxed text-primary/80">
                {rationale}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
