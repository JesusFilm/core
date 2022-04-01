export const secondsToTimeFormat = (seconds: number): string => {
  const date = new Date(seconds * 1000)
  return date.toISOString().substring(11, 19)
}

export const timeFormatToSeconds = (time: string): number => {
  const [hours, minutes, seconds] = time.split(':')
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}
