import {
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useRef
} from 'react'

import { Textarea } from '../Textarea'

interface PromptInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  onStop?: () => void
}

export function PromptInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop
}: PromptInputProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (input.trim().length > 0 && !isLoading) {
          onSubmit(e as unknown as FormEvent)
        }
      }
    },
    [input, isLoading, onSubmit]
  )

  const handleFormSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (input.trim().length > 0 && !isLoading) {
        onSubmit(e)
      }
    },
    [input, isLoading, onSubmit]
  )

  return (
    <form
      onSubmit={handleFormSubmit}
      style={{
        display: 'flex',
        gap: 8,
        padding: '8px 12px 12px',
        alignItems: 'flex-end',
        borderTop: '1px solid #e0e0e0'
      }}
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything"
        rows={1}
        disabled={isLoading}
        aria-label="Chat message input"
        style={{ flex: 1 }}
      />
      {isLoading ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop generating"
          tabIndex={0}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            backgroundColor: '#e0e0e0',
            borderRadius: 9999,
            cursor: 'pointer',
            fontSize: 16,
            color: '#666',
            padding: 0,
            outline: 'none',
            flexShrink: 0
          }}
        >
          ■
        </button>
      ) : (
        <button
          type="submit"
          disabled={input.trim().length === 0}
          aria-label="Send message"
          tabIndex={0}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            backgroundColor:
              input.trim().length > 0 ? '#6D28D9' : '#e0e0e0',
            borderRadius: 9999,
            cursor:
              input.trim().length > 0 ? 'pointer' : 'not-allowed',
            fontSize: 16,
            color: input.trim().length > 0 ? 'white' : '#999',
            padding: 0,
            outline: 'none',
            flexShrink: 0
          }}
        >
          ▶
        </button>
      )}
    </form>
  )
}
