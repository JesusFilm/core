// Per-device persistence for which collections the user has collapsed on the
// Team Templates tab (NES-1717). Keyed per team so collapse choices don't
// bleed across teams. Only collapsed ids are stored — the default is
// expanded, so an absent/empty entry means "everything open".

const STORAGE_KEY_PREFIX = 'templateCollectionsCollapse'

function storageKey(teamId: string): string {
  return `${STORAGE_KEY_PREFIX}:${teamId}`
}

export function getCollapsedCollectionIds(teamId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(teamId))
    if (raw == null) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
    return []
  }
}

export function setCollapsedCollectionIds(
  teamId: string,
  ids: readonly string[]
): void {
  try {
    localStorage.setItem(storageKey(teamId), JSON.stringify([...ids]))
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
}
