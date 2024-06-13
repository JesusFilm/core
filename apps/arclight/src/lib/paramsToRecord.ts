export function paramsToRecord(
  entries: IterableIterator<[string, string]>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of entries) {
    // each 'entry' is a [key, value] tupple
    result[key] = value
  }
  return result
}
