import {
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useRef
} from 'react'

import { SimpleButton } from '../SimpleButton'
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
        padding: '8px 16px 16px',
        alignItems: 'flex-end',
        borderTop: '1px solid #e0e0e0'
      }}
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        disabled={isLoading}
        aria-label="Chat message input"
        style={{ flex: 1 }}
      />
      {isLoading ? (
        <SimpleButton
          variant="ghost"
          size="md"
          onClick={onStop}
          aria-label="Stop generating"
          type="button"
        >
          Stop
        </SimpleButton>
      ) : (
        <SimpleButton
          variant="primary"
          size="md"
          type="submit"
          disabled={input.trim().length === 0}
          aria-label="Send message"
        >
          Send
        </SimpleButton>
      )}
    </form>
  )
}
