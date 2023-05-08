export function videoPositionToLabel(duration: number | null): string {
  if (duration == null) return '0:00'
  const minutes = Math.floor(duration % 3600000)
  const seconds = Math.floor((duration % 360000) % 60000)

  let result: string
  if (minutes === 0 && seconds === 0) {
    result = '< 0:01'
  } else if (seconds < 10) {
    result = `${minutes}:0${seconds}`
  } else {
    result = `${minutes}:${seconds}`
  }

  return result
}
