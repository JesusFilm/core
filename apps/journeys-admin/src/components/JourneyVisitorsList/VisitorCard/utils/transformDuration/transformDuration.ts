export function transformDuration(
  t: (str: string) => string,
  seconds?: number | null
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
