const desktopAppBarGap = 116
const desktopContainerPadding = 20

export const DESKTOP_APP_BAR_GAP = `${desktopAppBarGap}px`
export const DESKTOP_CONTAINER_PADDING = `${desktopContainerPadding}px`
export const DESKTOP_CONTAINER_WIDTH = '326px'
export const DESKTOP_CONTAINER_HEIGHT = `calc(100vh - ${desktopAppBarGap}px)`
export const DESKTOP_CONTAINER_MAX_HEIGHT = `calc(100vh - ${
  desktopAppBarGap + desktopContainerPadding
}px)`

export const MOBILE_APP_BAR_GAP = '60px'
export const MOBILE_CONTAINER_WIDTH = '100%'
export const MOBILE_CONTAINER_HEIGHT = `calc(100svh - ${MOBILE_APP_BAR_GAP})`
export const MOBILE_CONTAINER_MAX_HEIGHT = '100svh'

// shows beacon icon so that close button displays more consistent on mobile
export const BEACON_STYLE = `icon`
// hides beacon icon from visibility
export const BEACON_ICON_DISPLAY = 'none !important'
