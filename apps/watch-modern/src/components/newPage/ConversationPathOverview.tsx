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

  const containerRef = useRef<HTMLDivElement | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const [connections, setConnections] = useState<ConnectionCoordinates[]>([])

  stepRefs.current = stepRefs.current.slice(0, reversedSequence.length)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!containerRef.current || reversedSequence.length < 2) {
      setConnections([])
      return
    }

    const updateConnections = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const nodes = stepRefs.current.filter(
        (node): node is HTMLDivElement => Boolean(node)
      )

      if (nodes.length < 2) {
        setConnections([])
        return
      }

      const nextConnections = nodes.slice(0, -1).map((node, index) => {
        const nextNode = nodes[index + 1]!

        const startRect = node.getBoundingClientRect()
        const endRect = nextNode.getBoundingClientRect()

        return {
          x1:
            startRect.left + startRect.width / 2 - containerRect.left,
          y1: startRect.bottom - containerRect.top,
          x2: endRect.left + endRect.width / 2 - containerRect.left,
          y2: endRect.top - containerRect.top
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

    scheduleUpdate()

    const resizeObservers: ResizeObserver[] = []

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(scheduleUpdate)
      observer.observe(containerRef.current)
      stepRefs.current.forEach((node) => {
        if (node) {
          observer.observe(node)
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
  }, [reversedSequence.length])

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
                    {connections.map(({ x1, y1, x2, y2 }, index) => (
                      <line
                        key={`connection-${index}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                        strokeWidth={2}
                      />
                    ))}
                  </svg>
                ) : null}
                <ol className="relative flex flex-col gap-8">
                  {reversedSequence.map((movement, index) => (
                    <li key={`${movement}-${index}`} className="relative z-10">
                      <div
                        ref={(element) => {
                          stepRefs.current[index] = element
                        }}
                        className={`relative inline-flex max-w-[22rem] items-center rounded-2xl border border-primary/30 bg-background px-4 py-3 text-sm font-semibold capitalize text-primary shadow-sm ${
                          index % 2 === 1 ? 'ml-10' : ''
                        }`}
                      >
                        <span
                          aria-hidden
                          className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-l border-t border-primary/30 bg-background"
                        />
                        <span className="relative">{movement}</span>
                      </div>
                    </li>
                  ))}
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
