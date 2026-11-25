/**
 * Focus a field inside the canvas frame without scrolling: a plain focus()
 * (and the autoFocus attribute) scrolls every ancestor to centre the field,
 * including the editor page that holds the scaled frame.
 */
export function focusWithoutScroll(
  element: HTMLElement | null | undefined
): void {
  element?.focus({ preventScroll: true })
}
