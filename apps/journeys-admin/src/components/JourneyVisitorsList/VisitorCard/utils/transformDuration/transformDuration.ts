export function transformDuration(
  t: (str: string) => string,
  seconds?: number | null
): string {
  if (seconds == null || seconds === 0) {
    return '–'
  } else if (seconds <= 60) {
    return `${seconds} ${t('sec')}`
  } else {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${t('min')}`
  }
}
