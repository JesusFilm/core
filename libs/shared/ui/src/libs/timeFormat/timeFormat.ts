export const secondsToTimeFormat = (
  seconds: number,
  options?: { trimZeroes: boolean }
): string => {
  if (Number.isNaN(seconds))
    return options?.trimZeroes === true ? '0:00' : '00:00:00'
  const date = new Date(seconds * 1000)
  return options?.trimZeroes === true
    ? date.toISOString().substring(11, 19).replace(/^00:/, '').replace(/^0/, '')
    : date.toISOString().substring(11, 19);
}

export const secondsToMinutes = (seconds: number): number => {
  return Math.round(seconds / 60)
}

export const timeFormatToSeconds = (time: string): number => {
  const [hours, minutes, seconds] = time.split(':')
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}
