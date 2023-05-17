export function transformDuration(seconds: number | null): string {
  if (seconds == null) {
    return '0 min'
  } else if (seconds <= 60) {
    return `${seconds} sec`
  } else {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }
}
