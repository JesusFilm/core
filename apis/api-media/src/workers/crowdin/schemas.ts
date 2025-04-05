import { z } from 'zod'

export const translationSchema = z.object({
  stringId: z.number(),
  contentType: z.literal('text/plain'),
  translationId: z.number().optional(),
  text: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    fullName: z.string().optional(),
    avatarUrl: z.string().optional()
  }),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional()
})

export const sourceStringSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  fileId: z.number(),
  branchId: z.number().nullable().optional(),
  directoryId: z.number().nullable().optional(),
  identifier: z.string().nullable(),
  text: z.string(),
  type: z.string(),
  context: z.string().nullable().optional(),
  maxLength: z.number().nullable().optional(),
  isHidden: z.boolean(),
  isDuplicate: z.boolean(),
  masterStringId: z.union([z.boolean(), z.number()]).nullable(),
  revision: z.number(),
  hasPlurals: z.boolean(),
  isIcu: z.boolean(),
  labelIds: z.array(z.number()),
  createdAt: z.string(),
  updatedAt: z.string().nullable()
})

export const processedTranslationSchema = z.object({
  sourceString: sourceStringSchema,
  translation: translationSchema,
  languageCode: z.string()
})

export function parseTranslation(data: unknown) {
  return translationSchema.safeParse(data)
}

export function parseSourceString(data: unknown) {
  return sourceStringSchema.safeParse(data)
}

export function parseProcessedTranslation(data: unknown) {
  return processedTranslationSchema.safeParse(data)
}

export function parseTranslations(data: unknown[]) {
  const validTranslations = []
  const invalidTranslations = []

  for (const item of data) {
    const result = translationSchema.safeParse(item)
    if (result.success) {
      validTranslations.push(result.data)
    } else {
      invalidTranslations.push({
        id: (item as any)?.stringId ?? -1,
        error: result.error.message
      })
    }
  }

  return { validTranslations, invalidTranslations }
}

export function parseSourceStrings(data: unknown[]) {
  const validStrings = []
  const invalidStrings = []

  for (const item of data) {
    const result = sourceStringSchema.safeParse(item)
    if (result.success) {
      validStrings.push(result.data)
    } else {
      invalidStrings.push({
        id: (item as any)?.id ?? -1,
        error: result.error.message
      })
    }
  }

  return { validStrings, invalidStrings }
}
