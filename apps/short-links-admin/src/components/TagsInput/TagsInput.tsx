'use client'

import { XIcon } from 'lucide-react'
import { KeyboardEvent, ReactElement, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface TagsInputProps {
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  helperText?: string
  disabled?: boolean
  id?: string
}

function normalizeTags(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const trimmed = value.trim()
    if (trimmed === '' || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }
  return result
}

export function TagsInput({
  value,
  onChange,
  label = 'Tags',
  helperText,
  disabled = false,
  id = 'tags'
}: TagsInputProps): ReactElement {
  const [draft, setDraft] = useState('')

  function commitDraft(): void {
    if (draft.trim() === '') return
    onChange(normalizeTags([...value, draft]))
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitDraft()
      return
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function handleRemove(tag: string): void {
    onChange(value.filter((candidate) => candidate !== tag))
  }

  return (
    <Field name={id} disabled={disabled}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1" data-testid={`${id}-chips`}>
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pe-1">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => handleRemove(tag)}
                disabled={disabled}
                className="rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-2"
              >
                <XIcon aria-hidden="true" className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        disabled={disabled}
        className="w-full"
      />
      <FieldDescription>
        {helperText ?? 'Press Enter to add a tag'}
      </FieldDescription>
    </Field>
  )
}
