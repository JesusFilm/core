import { useEffect, useRef, useState } from 'react'

import { messageOf } from '../messageOf'

export interface CommittedFieldOptions {
  /** The value as stored: the field shows it until the author types, and follows it as it changes. */
  committed: string
  /** The value a commit checks and saves, from what was typed; trims by default. */
  normalize?: (typed: string) => string
  /** The pure pre-check: the message to show instead of saving, if any. */
  validate?: (value: string) => string | undefined
  /**
   * Write the value. A rejection is the API refusing it (see `onRefused`);
   * a save that reports its own failures (a Command) returns nothing.
   */
  save: (value: string) => Promise<unknown> | void
  /**
   * The message a refusal shows under the field, which keeps the refused
   * value; undefined when the panel reported the refusal elsewhere (a
   * snackbar), and the field goes back to the stored value. The API's
   * message verbatim by default.
   */
  onRefused?: (error: unknown) => string | undefined
  /** When it changes the draft and the error are dropped, and the field shows `committed` again. */
  resetKey?: unknown
}

export interface CommittedField {
  /** What the field shows: the draft while typing, else the stored value. */
  value: string
  onChange: (next: string) => void
  /** Commit what was typed: normalize it, skip an unchanged value, pre-check it, then save it. */
  onBlur: () => void
  /** The pre-check's message, or the API's message verbatim when the save was refused. */
  error?: string
}

function trim(typed: string): string {
  return typed.trim()
}

/**
 * A campaign panel's text field committed on blur (or Enter): the draft
 * follows the stored value, a commit normalizes what was typed, skips an
 * unchanged value, pre-checks it and saves it, and a refused save shows the
 * API's message under the field. While a save is in flight, or an error
 * describes a refused value, the field keeps what the author is reading
 * about; once that clears it adopts the stored (or rolled-back) value again.
 * Typing clears the error.
 */
export function useCommittedField({
  committed,
  normalize = trim,
  validate,
  save,
  onRefused = messageOf,
  resetKey
}: CommittedFieldOptions): CommittedField {
  const [value, setValue] = useState(committed)
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const held = saving || error != null
  // The stored value the draft is based on, and whether the stored value
  // moved (a save shown optimistically, then answered or rolled back) while
  // the field was held.
  const adopted = useRef(committed)
  const movedWhileHeld = useRef(false)

  useEffect(() => {
    if (held) {
      if (committed !== adopted.current) movedWhileHeld.current = true
      return
    }
    if (committed === adopted.current && !movedWhileHeld.current) return
    adopted.current = committed
    movedWhileHeld.current = false
    setValue(committed)
  }, [committed, held])

  useEffect(() => {
    adopted.current = committed
    movedWhileHeld.current = false
    setValue(committed)
    setError(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  function onChange(next: string): void {
    // Typing over a refused value starts from what is stored now.
    adopted.current = committed
    movedWhileHeld.current = false
    setValue(next)
    setError(undefined)
  }

  function onBlur(): void {
    const next = normalize(value)
    setValue(next)
    if (next === committed) {
      setError(undefined)
      return
    }
    const message = validate?.(next)
    setError(message)
    if (message != null) return
    const pending = save(next)
    if (pending == null) return
    setSaving(true)
    void pending
      .then(
        () => undefined,
        (saveError: unknown) => {
          const refusal = onRefused(saveError)
          setError(refusal)
          // Reported elsewhere: once released, take the rolled-back value.
          if (refusal == null) movedWhileHeld.current = true
        }
      )
      .finally(() => setSaving(false))
  }

  return { value, onChange, onBlur, error }
}
