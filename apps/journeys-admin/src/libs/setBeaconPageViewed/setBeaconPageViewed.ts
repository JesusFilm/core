export function setBeaconPageViewed(route: string): void {
  console.log(document.location.href)
  if (window.Beacon != null) {
    window.Beacon('event', {
      type: 'page-viewed',
      url: document.location.href,
      title: `Clicked on ${route}`
    })
  }
}
