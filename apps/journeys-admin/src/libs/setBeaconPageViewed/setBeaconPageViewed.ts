export function setBeaconPageViewed(route: string): void {
  if (window.Beacon != null) {
    window.Beacon('event', {
      type: 'page-viewed',
      url: document.location.href,
      title: `Clicked on ${route}`
    })
  }
}
