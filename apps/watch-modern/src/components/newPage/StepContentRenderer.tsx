import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'

import { AutoResizeTextarea } from '@core/shared/uimodern/components/textarea'
import { Button } from '../ui/button'

export type StepContentRendererProps = {
  content: string
  stepIndex: number
  isEditing: boolean
  onContentChange: (value: string) => void
  onFocus: () => void
  copiedStepIndex: number | null
  onCopyStep: (payload: { content: string; keywords: string[]; mediaPrompt: string }, stepIndex: number) => Promise<void> | void
  onEditingComplete: (stepIndex: number) => void
  className?: string
}

export function StepContentRenderer({
  content,
  stepIndex,
  isEditing,
  onContentChange,
  onFocus,
  copiedStepIndex,
  onCopyStep,
  onEditingComplete,
  className
}: StepContentRendererProps): ReactElement {
  const [localContent, setLocalContent] = useState(content)

  useEffect(() => {
    if (!isEditing) {
      setLocalContent(content)
    }
  }, [content, isEditing])

  const handleBlur = () => {
    onContentChange(localContent)
    onEditingComplete(stepIndex)
  }

  useEffect(() => {
    if (!isEditing) {
      return
    }

    const focusTextarea = () => {
      const textarea = document.querySelector<HTMLTextAreaElement>(
        `textarea[data-step-index="${stepIndex}"]`
      )
      textarea?.focus()
    }

    const timeoutId = window.setTimeout(focusTextarea, 0)
    return () => window.clearTimeout(timeoutId)
  }, [isEditing, stepIndex])

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    void onCopyStep(
      {
        content: isEditing ? localContent : content,
        keywords: [],
        mediaPrompt: ''
      },
      stepIndex
    )
  }

  const renderMarkdown = (text: string): ReactElement[] => {
    const lines = text.split('\n')
    const elements: ReactElement[] = []
    let key = 0

    for (const line of lines) {
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-3xl font-bold mb-2 mt-4 first:mt-0">
            {line.substring(2)}
          </h1>
        )
        continue
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-xl font-semibold mb-2 mt-3">
            {line.substring(3)}
          </h2>
        )
        continue
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-lg font-medium mb-1 mt-2">
            {line.substring(4)}
          </h3>
        )
        continue
      }

      if (line.includes('**')) {
        const parts = line.split('**')
        const processed = parts.map((part, idx) =>
          idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
        )
        elements.push(
          <p key={key++} className="mb-2">
            {processed}
          </p>
        )
        continue
      }

      if (line.includes('*')) {
        const parts = line.split('*')
        const processed = parts.map((part, idx) =>
          idx % 2 === 1 ? <em key={idx}>{part}</em> : part
        )
        elements.push(
          <p key={key++} className="mb-2">
            {processed}
          </p>
        )
        continue
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={key++} className="mb-1">
            {line.substring(2)}
          </li>
        )
        continue
      }

      if (line.trim() === '') {
        continue
      }

      elements.push(
        <p key={key++} className="mb-2">
          {line}
        </p>
      )
    }

    return elements
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    event.preventDefault()
    onFocus()
  }

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
          className="min-h-[160px] text-sm font-mono  whitespace-pre-wrap bg-white border-none shadow-sm outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 px-6 py-6 rounded-tl rounded-tr-md"
          onClick={onFocus}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {renderMarkdown(content)}
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 gap-1 h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
        onClick={handleCopy}
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
