export function transformDuration(
  seconds: number | null,
  t: (str: string) => string
): string {
  if (seconds == null) {
    return t('0 min')
  } else if (seconds <= 60) {
    return `${seconds} ${t('sec')}`
  } else {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${t('min')}`
  }
}
