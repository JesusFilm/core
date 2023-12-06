export function prefillBeaconSearch(params: string): void {
  // add load beacon functionality when it's in
  if (window.Beacon != null) {
    window.Beacon('search', params)
  }
}
