import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import { Check, Copy } from 'lucide-react'

import type { GeneratedStepContent } from '../../libs/storage'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { AutoResizeTextarea } from '@/components/ui/textarea'

type StepHandlers = {
  onContentChange?: (value: string) => void
  onFocus?: () => void
  onExitEditMode?: () => void
}

export type StepsListProps = {
  editableSteps: GeneratedStepContent[]
  editingStepIndices: Set<number>
  stepHandlers: Record<number, StepHandlers>
  copiedStepIndex: number | null
  deriveHeadingFromContent: (content: string, fallback: string) => string
  onCopyStep: (content: string, index: number) => Promise<void> | void
  onStepVisible: (step: GeneratedStepContent, index: number) => void
  className?: string
}

type StepContentRendererProps = {
  content: string
  stepIndex: number
  isEditing: boolean
  copiedStepIndex: number | null
  onCopy: (content: string, index: number) => Promise<void> | void
  onContentChange?: (value: string) => void
  onFocus?: () => void
  onExitEditMode?: () => void
  className?: string
}

const useIntersectionObserver = (
  callback: () => void,
  options?: IntersectionObserverInit
) => {
  const [element, setElement] = useState<Element | null>(null)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    if (!element || hasTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback()
          setHasTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [element, callback, hasTriggered, options])

  return { ref: setElement }
}

const StepContentRenderer = ({
  content,
  stepIndex,
  isEditing,
  copiedStepIndex,
  onCopy,
  onContentChange,
  onFocus,
  onExitEditMode,
  className
}: StepContentRendererProps) => {
  const [localContent, setLocalContent] = useState(content)

  useEffect(() => {
    if (!isEditing) {
      setLocalContent(content)
    }
  }, [content, isEditing])

  useEffect(() => {
    if (!isEditing) return

    const timeout = window.setTimeout(() => {
      const textarea = document.querySelector(
        `textarea[data-step-index="${stepIndex}"]`
      ) as HTMLTextAreaElement | null
      textarea?.focus()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [isEditing, stepIndex])

  const handleBlur = () => {
    onContentChange?.(localContent)
    onExitEditMode?.()
  }

  const renderMarkdown = useMemo(() => {
    const baseStyles: CSSProperties = { marginBottom: '0.5rem' }

    return (text: string) => {
      const lines = text.split('\n')
      const elements = lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <h1
              key={`h1-${index}`}
              className="text-3xl font-bold mb-2 mt-4 first:mt-0"
            >
              {line.substring(2)}
            </h1>
          )
        }

        if (line.startsWith('## ')) {
          return (
            <h2 key={`h2-${index}`} className="text-xl font-semibold mb-2 mt-3">
              {line.substring(3)}
            </h2>
          )
        }

        if (line.startsWith('### ')) {
          return (
            <h3 key={`h3-${index}`} className="text-lg font-medium mb-1 mt-2">
              {line.substring(4)}
            </h3>
          )
        }

        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={`li-${index}`} className="mb-1">
              {line.substring(2)}
            </li>
          )
        }

        if (line.includes('**')) {
          const parts = line.split('**')
          return (
            <p key={`bold-${index}`} className="mb-2">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
              )}
            </p>
          )
        }

        if (line.includes('*')) {
          const parts = line.split('*')
          return (
            <p key={`italic-${index}`} className="mb-2">
              {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? <em key={partIndex}>{part}</em> : part
              )}
            </p>
          )
        }

        if (line.trim() === '') {
          return null
        }

        return (
          <p key={`p-${index}`} className="mb-2" style={baseStyles}>
            {line}
          </p>
        )
      })

      return elements.filter(Boolean)
    }
  }, [])

  return (
    <div className={`relative ${className ?? ''}`}>
      {isEditing ? (
        <AutoResizeTextarea
          value={localContent}
          onChange={(event) => setLocalContent(event.target.value)}
          onBlur={handleBlur}
          className="min-h-[160px] whitespace-pre-wrap bg-white border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 text-sm font-mono px-6 py-6 rounded-bl-none rounded-br-none"
          data-step-index={stepIndex}
        />
      ) : (
        <div
          className="min-h-[160px] text-sm font-mono whitespace-pre-wrap bg-white border-none shadow-sm outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 px-6 py-6 rounded-tl rounded-tr-md"
          onClick={() => onFocus?.()}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onFocus?.()
            }
          }}
        >
          {renderMarkdown(content)}
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`absolute top-2 right-2 gap-1 h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void onCopy(isEditing ? localContent : content, stepIndex)
        }}
        onMouseDown={(event) => event.preventDefault()}
        title={copiedStepIndex === stepIndex ? 'Copied!' : 'Copy content'}
      >
        {copiedStepIndex === stepIndex ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

export const StepsList = ({
  editableSteps,
  editingStepIndices,
  stepHandlers,
  copiedStepIndex,
  deriveHeadingFromContent,
  onCopyStep,
  onStepVisible,
  className
}: StepsListProps) => {
  const containerClass = className ? `${className}` : ''

  return (
    <div className={containerClass}>
      {editableSteps.map((step, index) => {
        const heading = deriveHeadingFromContent(
          step.content,
          `Step ${index + 1}`
        )
        const cardKey = heading ? `${heading}-${index}` : `step-${index}`
        const { ref: cardRef } = useIntersectionObserver(
          () => onStepVisible(step, index),
          { threshold: 0.1 }
        )

        return (
          <div key={cardKey} ref={cardRef}>
            <Card className="bg-transparent shadow-none">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <StepContentRenderer
                    content={step.content}
                    className="-mx-6"
                    stepIndex={index}
                    isEditing={editingStepIndices.has(index)}
                    copiedStepIndex={copiedStepIndex}
                    onCopy={onCopyStep}
                    onContentChange={stepHandlers[index]?.onContentChange}
                    onFocus={stepHandlers[index]?.onFocus}
                    onExitEditMode={stepHandlers[index]?.onExitEditMode}
                  />
                </div>
                <div className="space-y-2 hidden">
                  <h4 className="text-sm font-medium">Media Prompt</h4>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {step.mediaPrompt || 'No prompt provided.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

export default StepsList
