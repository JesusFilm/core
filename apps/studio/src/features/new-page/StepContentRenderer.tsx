"use client"

import { Check, Copy } from 'lucide-react'
import { type ReactElement, useEffect, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'

type StepContentRendererProps = {
  content: string
  stepIndex: number
  isEditing: boolean
  onContentChange?: (value: string) => void
  onFocus?: () => void
  copiedStepIndex: number | null
  className?: string
  onCopy: (stepIndex: number, content: string) => void | Promise<void>
  onEditingComplete: (stepIndex: number) => void
}

export const StepContentRenderer = ({
  content,
  stepIndex,
  isEditing,
  onContentChange,
  onFocus,
  copiedStepIndex,
  className,
  onCopy,
  onEditingComplete
}: StepContentRendererProps) => {
  const [localContent, setLocalContent] = useState(content)

  useEffect(() => {
    if (!isEditing) {
      setLocalContent(content)
    }
  }, [content, isEditing])

  const handleBlur = () => {
    onContentChange?.(localContent)
    onEditingComplete(stepIndex)
  }

  useEffect(() => {
    if (isEditing) {
      const timeout = setTimeout(() => {
        const textarea = document.querySelector<HTMLTextAreaElement>(
          `textarea[data-step-index="${stepIndex}"]`
        )
        textarea?.focus()
      }, 0)

      return () => clearTimeout(timeout)
    }
    return undefined
  }, [isEditing, stepIndex])

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    const elements: ReactElement[] = []
    let key = 0

    for (const line of lines) {
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-2xl font-bold mb-2 mt-4 first:mt-0">
            {line.substring(2)}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-xl font-semibold mb-2 mt-3">
            {line.substring(3)}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-lg font-medium mb-1 mt-2">
            {line.substring(4)}
          </h3>
        )
      } else if (line.includes('**')) {
        const parts = line.split('**')
        elements.push(
          <p key={key++} className="mb-2">
            {parts.map((part, index) =>
              index % 2 === 1 ? <strong key={index}>{part}</strong> : part
            )}
          </p>
        )
      } else if (line.includes('*')) {
        const parts = line.split('*')
        elements.push(
          <p key={key++} className="mb-2">
            {parts.map((part, index) =>
              index % 2 === 1 ? <em key={index}>{part}</em> : part
            )}
          </p>
        )
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={key++} className="mb-1">
            {line.substring(2)}
          </li>
        )
      } else if (line.trim() !== '') {
        elements.push(
          <p key={key++} className="mb-2">
            {line}
          </p>
        )
      }
    }

    return elements
  }

  const copyStep = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void onCopy(stepIndex, isEditing ? localContent : content)
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      {isEditing ? (
        <Textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          onBlur={handleBlur}
          className="min-h-[160px] whitespace-pre-wrap bg-white border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 text-sm font-mono px-6 py-6 rounded-bl-none rounded-br-none"
          data-step-index={stepIndex}
        />
      ) : (
        <div
          className="min-h-[160px] text-sm font-mono  whitespace-pre-wrap bg-white border-none shadow-sm outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 px-6 py-6 rounded-tl rounded-tr-md"
          onClick={onFocus}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onFocus?.()
            }
          }}
        >
          {(() => {
            try {
              return renderMarkdown(content)
            } catch (error) {
              console.error('MDX rendering error:', error)
              return content
            }
          })()}
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 gap-1 h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
        onClick={copyStep}
        onMouseDown={(e) => e.preventDefault()}
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
