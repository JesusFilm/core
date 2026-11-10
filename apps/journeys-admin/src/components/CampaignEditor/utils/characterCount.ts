import { TFunction } from 'i18next'

/** A field's counter, `length / max`; the caller measures the length (`textLength` for text, `urlLength` for a link). */
export function characterCount(
  t: TFunction,
  length: number,
  max: number
): string {
  return t('{{length}} / {{max}}', { length, max })
}
