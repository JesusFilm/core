import { SyntheticEvent } from 'react'

/** Keeps a click inside a canvas control from selecting the block under it. */
export function handleStopPropagation(event: SyntheticEvent): void {
  event.stopPropagation()
}
