export function hasTouchScreen(): boolean {
  let hasTouchScreen = false
  if ('maxTouchPoints' in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0
  } else {
    const mQ = matchMedia?.('(pointer:coarse)')
    if (mQ?.media === '(pointer:coarse)') {
      hasTouchScreen = !!mQ.matches
    } else if ('orientation' in window) {
      hasTouchScreen = true // deprecated, but good fallback
    } else {
      // Only as a last resort, fall back to user agent sniffing
      const UA = (navigator as Navigator).userAgent
      hasTouchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
    }
  }
  return hasTouchScreen
}

// TODO: should only resort to user agent sniffing as a last resport
export function isIPhone(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.userAgent === 'undefined'
  )
    return false

  const userAgent = navigator.userAgent
  return userAgent.includes('iPhone')
}

// TODO: should only resort to user agent sniffing as a last resport
export function isIOS(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.userAgent === 'undefined'
  )
    return false

  const userAgent = navigator.userAgent
  return /iPad|iPhone|Macintosh|iPod/.test(userAgent)
}

// TODO: should only resort to user agent sniffing as a last resport
export function isIOSTouchScreen(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.userAgent === 'undefined'
  )
    return false

  const userAgent = navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    // iPad on iOS 13 detection
    // iPad iOS 13 user agent is "Macintosh" on iOS13 and above, see: https://forums.developer.apple.com/forums/thread/119186
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  )
}

// TODO: should only resort to user agent sniffing as a last resport
export function isMobile(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.userAgent === 'undefined'
  )
    return false
  const userAgent = navigator.userAgent
  return /windows phone/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)
}
