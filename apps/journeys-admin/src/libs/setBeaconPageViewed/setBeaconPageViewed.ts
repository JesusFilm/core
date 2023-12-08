export function setBeaconPageViewed(action: string): void {
  console.log('docuemnt', document.location.href)

  if (window.Beacon != null) {
    window.Beacon('event', {
      type: 'page-viewed',
      url: document.location.href,
      title: `Clicked on ${action}`
    })
  }
}
