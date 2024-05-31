import camelCase from 'lodash/camelCase'
import startCase from 'lodash/startCase'

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
