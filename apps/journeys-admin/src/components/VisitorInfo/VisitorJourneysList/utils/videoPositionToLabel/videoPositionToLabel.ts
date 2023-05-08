export function videoPositionToLabel(duration: number | null): string {
  if (duration == null) return '0:00'
  const minutes = (duration / 60).toFixed(2)
  const result = minutes.replace('.', ':')
  return result
}
