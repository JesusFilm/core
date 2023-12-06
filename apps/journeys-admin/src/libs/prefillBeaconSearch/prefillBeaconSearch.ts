export function prefillBeaconSearch(params: string): void {
  // add load beacon functionality when it's in
  if (window.Beacon != null) {
    window.Beacon('session-data', {
      lastAction: `clicked on ${params}`
    })
    window.Beacon('search', params)
  }
}
