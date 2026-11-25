import { z } from 'zod'

import { plainText } from './presentationContract'

export function validSelectionBounds(
  minimum: unknown,
  maximum: unknown,
  count: number
): boolean {
  const min = minimum ?? 0,
    max = maximum ?? count
  return (
    typeof min === 'number' &&
    Number.isInteger(min) &&
    typeof max === 'number' &&
    Number.isInteger(max) &&
    min >= 0 &&
    min <= max &&
    max <= count &&
    (count === 0 || max >= 1)
  )
}

export const formLocale = z.enum([
  'en',
  'es-ES',
  'fr-FR',
  'de-DE',
  'pt-BR',
  'ar-SA',
  'am-ET',
  'bn-BD',
  'hi-IN',
  'id-ID',
  'ja-JP',
  'ko-KR',
  'mn-MN',
  'ms-MY',
  'my-MM',
  'ne-NP',
  'ru-RU',
  'th-TH',
  'tl-PH',
  'tr-TR',
  'ur-PK',
  'vi-VN',
  'zh-Hans-CN',
  'zh-Hant-TW'
])
export const formText = z.string().max(250)
export const responseFields = {
  label: formText.optional(),
  placeholder: formText.nullable().optional(),
  hint: formText.nullable().optional(),
  required: z.boolean().nullable().optional(),
  hideLabel: z.boolean().optional(),
  minRows: z.number().int().min(1).max(4).nullable().optional(),
  responseType: z.enum(['freeForm', 'name', 'email', 'phone']).optional(),
  locale: formLocale.optional()
}
const option = z
  .object({
    key: z.string().regex(/^(?!__proto__$)[a-z0-9_]{1,32}$/),
    label: plainText
  })
  .strict()
export const formContent = [
  z
    .object({
      kind: z.literal('poll'),
      gridView: z.boolean().optional(),
      options: z.array(option).max(200)
    })
    .strict(),
  z
    .object({
      kind: z.literal('multiselect'),
      min: z.number().int().nonnegative().nullable().optional(),
      max: z.number().int().nonnegative().nullable().optional(),
      options: z.array(option).min(2).max(200),
      locale: formLocale.optional()
    })
    .strict(),
  z.object({ kind: z.literal('response'), ...responseFields }).strict()
] as const
