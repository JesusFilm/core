export function paramsToRecord(entries: any): Record<string, string> {
  console.log(entries)
  const result: Record<string, string> = {}
  for (const [key, value] of entries) {
    // each 'entry' is a [key, value] tupple
    result[key] = value
  }
  return result
}
