import { RefObject } from 'react'

export function clearPollingInterval(
  videoId: string,
  pollingIntervalsRef: RefObject<Map<string, NodeJS.Timeout>>
): void {
  const interval = pollingIntervalsRef.current.get(videoId)
  if (interval != null) {
    clearInterval(interval)
    pollingIntervalsRef.current.delete(videoId)
  }
}
