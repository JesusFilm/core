import { RefObject, useEffect, useRef } from 'react'

// When clicking outside the card in canvas
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void | Promise<void>
): RefObject<T> {
  const elementRef = useRef<T>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      const elementClicked = event.target as HTMLElement
      const canvasClicked =
        (elementClicked.classList.contains('EditorCanvas') ||
          elementClicked.classList.contains('CanvasStack')) ??
        false
      // Prevent double callback triggering
      const inputSelected =
        elementRef.current?.classList.contains('Mui-focused') ?? false
      if (elementRef.current != null && inputSelected && canvasClicked)
        void callback()
    }
    // Need to set capture to true
    // https://github.com/facebook/react/issues/20325
    window.addEventListener('click', handleClick, { capture: true })
    return () =>
      window.removeEventListener('click', handleClick, { capture: true })
  }, [callback])

  return elementRef
}
