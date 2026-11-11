import { KeyboardEvent, MouseEvent } from 'react'

export interface SelectableProps {
  tabIndex: 0
  'aria-label': string
  onClick: (event: MouseEvent<HTMLElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
}

/**
 * Makes a canvas element selectable by mouse and keyboard: focusable,
 * labelled, a click selects it, and so do Enter and Space while it has focus
 * itself. A key typed in a field nested inside it (an inline text being
 * edited) never selects it. Neither the click nor the key reaches the
 * elements around it. A leaf adds `role="button"`; a container that holds
 * other selectables stays without a role, so no button nests in another.
 */
export function selectableProps(
  onSelect: () => void,
  label: string
): SelectableProps {
  return {
    tabIndex: 0,
    'aria-label': label,
    onClick: (event) => {
      event.stopPropagation()
      onSelect()
    },
    onKeyDown: (event) => {
      if (event.target !== event.currentTarget) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      event.stopPropagation()
      onSelect()
    }
  }
}
