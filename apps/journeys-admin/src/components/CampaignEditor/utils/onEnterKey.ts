import { KeyboardEvent } from 'react'

/** A key-down handler that runs `action` on Enter instead of submitting or adding a line. */
export function onEnterKey(
  action: () => void
): (event: KeyboardEvent<HTMLElement>) => void {
  return function handleEnterKey(event): void {
    if (event.key !== 'Enter') return
    event.preventDefault()
    action()
  }
}
