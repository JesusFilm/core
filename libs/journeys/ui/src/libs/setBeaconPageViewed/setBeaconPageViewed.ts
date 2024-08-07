import camelCase from 'lodash/camelCase'
import startCase from 'lodash/startCase'

export interface EventObject {
  type: string
  url: string
  title: string
}

export interface FormObject {
  name: string
  email: string
}

// BeaconInfo contains information about the beacon
// add types as needed
interface BeaconInfo {
  beaconId: string
  beaconName: string
  status: {
    isMounted: boolean
    isOpened: boolean
  }
}

declare global {
  interface Window {
    Beacon?: ((fn: 'init', id: string) => void) &
      ((
        fn: 'config',
        config: { mode: 'askFirst'; enableFabAnimation: boolean }
      ) => void) &
      ((fn: 'open') => void) &
      ((fn: 'close') => void) &
      ((fn: 'event', eventObject: EventObject) => void) &
      ((fn: 'toggle') => void) &
      ((fn: 'search', value: string) => void) &
      ((fn: 'on', eventType: string, callback: () => void) => void) &
      ((fn: 'prefill', formObject: FormObject) => void) &
      ((fn: 'navigate', route: string) => void) &
      ((fn: 'info') => BeaconInfo | null)
  }
}

export function setBeaconPageViewed(route: string): void {
  if (window.Beacon != null) {
    window.Beacon('event', {
      type: 'page-viewed',
      url: document.location.href,
      title: `Clicked on ${route}`
    })

    window.Beacon('on', 'open', () => {
      const query = startCase(camelCase(route))
      window.Beacon?.('search', query)
    })
  }
}

export function setBeaconRoute(route: string): void {
  if (window.Beacon != null) {
    window.Beacon('navigate', route)
  }
}

export function openBeacon(): void {
  if (window.Beacon != null) {
    window.Beacon('open')
  }
}

export function isBeaconOpen(): boolean {
  if (window.Beacon != null) {
    const info = window.Beacon('info')
    if (info != null) {
      return info.status.isOpened
    }
  }
  return false
}
