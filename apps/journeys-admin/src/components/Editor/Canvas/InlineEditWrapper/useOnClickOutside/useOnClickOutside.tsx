import { RefObject, useEffect, useRef } from 'react'

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void | Promise<void>
): RefObject<T> {
  const elementRef = useRef<T>(null)
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (
        elementRef.current != null &&
        !elementRef.current.contains(event.target as HTMLElement) &&
        elementRef.current.classList.contains('Mui-focused')
      ) {
        void callback()
      }
    }
    // Need to set capture to true
    // https://github.com/facebook/react/issues/20325
    window.addEventListener('click', handleClick, { capture: true })
    return () =>
      window.removeEventListener('click', handleClick, { capture: true })
  }, [callback])

  return elementRef
}
