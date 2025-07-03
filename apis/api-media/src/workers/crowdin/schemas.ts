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
