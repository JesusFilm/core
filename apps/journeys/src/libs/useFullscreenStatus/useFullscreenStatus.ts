import { Dispatch, SetStateAction, useLayoutEffect, useState } from 'react'

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>
    msExitFullscreen?: () => Promise<void>
    webkitExitFullscreen?: () => Promise<void>
    mozFullScreenElement?: Element
    msFullscreenElement?: Element
    webkitFullscreenElement?: Element
  }

  interface HTMLElement {
    msRequestFullscreen?: () => Promise<void>
    mozRequestFullscreen?: () => Promise<void>
    webkitRequestFullscreen?: () => Promise<void>
  }
}

export default function useFullscreenStatus(
  elRef
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isFullscreen, setIsFullscreen] = useState(
    document[getBrowserFullscreenElementProp()] != null
  )

  const setFullscreen = (value: boolean): void => {
    if (elRef.current == null) return

    if (value)
      elRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(document[getBrowserFullscreenElementProp()] != null)
        })
        .catch(() => {
          setIsFullscreen(false)
        })
    else
      elRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(document[getBrowserFullscreenExitProp()]() != null)
        })
        .catch(() => {
          setIsFullscreen(false)
        })
  }

  useLayoutEffect(() => {
    document.onfullscreenchange = () =>
      setIsFullscreen(document[getBrowserFullscreenElementProp()] != null)

    return () => {
      document.onfullscreenchange = null
    }
  })

  return [isFullscreen, setFullscreen]
}

// throw error on webkit and unsupported browsers
function getBrowserFullscreenElementProp(): string {
  if (typeof document.fullscreenElement !== 'undefined') {
    return 'fullscreenElement'
  } else if (typeof document.mozFullScreenElement !== 'undefined') {
    return 'mozFullScreenElement'
  } else if (typeof document.msFullscreenElement !== 'undefined') {
    return 'msFullscreenElement'
  } else {
    throw new Error(
      'fullscreenElement is not supported by this browser - please try again with chrome'
    )
  }
}

// throw error on webkit and unsupported browsers
function getBrowserFullscreenExitProp(): string {
  if (typeof document.fullscreenElement !== 'undefined') {
    return 'exitFullscreen'
  } else if (typeof document.mozFullScreenElement !== 'undefined') {
    return 'mozCancelFullScreen'
  } else if (typeof document.msFullscreenElement !== 'undefined') {
    return 'msExitFullscreen'
  } else {
    throw new Error(
      'fullscreenElement is not supported by this browser - please try again with chrome'
    )
  }
}
