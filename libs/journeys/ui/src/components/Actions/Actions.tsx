import { ReactElement, useCallback } from 'react'

import { SimpleButton } from '../SimpleButton'

interface ActionsProps {
  content: string
  onRegenerate?: () => void
  isLastAssistantMessage: boolean
}

export function Actions({
  content,
  onRegenerate,
  isLastAssistantMessage
}: ActionsProps): ReactElement {
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content)
  }, [content])

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: '2px 16px 2px 52px'
      }}
    >
      <SimpleButton
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        aria-label="Copy message"
        style={{ fontSize: 12, color: '#999' }}
      >
        Copy
      </SimpleButton>
      {isLastAssistantMessage && onRegenerate != null && (
        <SimpleButton
          size="sm"
          variant="ghost"
          onClick={onRegenerate}
          aria-label="Regenerate response"
          style={{ fontSize: 12, color: '#999' }}
        >
          Retry
        </SimpleButton>
      )}
    </div>
  )
}
