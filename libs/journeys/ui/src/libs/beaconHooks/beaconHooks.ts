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
      ((fn: 'navigate', route: string) => void)
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
