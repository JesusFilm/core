export function trackPageViewedBeacon(title: string): void {
  // add load beacon functionality when it's in
  if (window.Beacon != null) {
    window.Beacon('event', {
      type: 'page-viewed',
      url: document.location.href,
      title
    })
    console.log(document.location.href)
    window.Beacon('suggest')
  }
}
