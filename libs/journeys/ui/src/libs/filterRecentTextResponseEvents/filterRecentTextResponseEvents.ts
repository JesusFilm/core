export interface Event {
  id: string
  __typename: string
  blockId?: string | null
  createdAt: Date
}

export function filterRecentTextResponseEvents<T extends Event>(
  items: T[]
): T[] {
  const eventMap = new Map<string, T>()
  items.forEach((event) => {
    if (
      event.__typename === 'TextResponseSubmissionEvent' &&
      event.blockId != null
    ) {
      const existingEvent = eventMap.get(event.blockId)
      if (
        existingEvent == null ||
        new Date(event.createdAt) > new Date(existingEvent.createdAt)
      ) {
        eventMap.set(event.blockId, event)
      }
    } else {
      eventMap.set(event.id, event)
    }
  })
  return Array.from(eventMap.values())
}
