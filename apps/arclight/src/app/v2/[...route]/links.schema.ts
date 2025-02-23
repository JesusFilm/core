import { z } from '@hono/zod-openapi'

export const linksSchema = z.object({
  self: z.object({
    href: z.string()
  }),
  mediaComponentLanguages: z
    .object({
      href: z.string()
    })
    .optional(),
  osisBibleBooks: z
    .object({
      href: z.string()
    })
    .optional(),
  mediaComponentLinks: z
    .object({
      href: z.string()
    })
    .optional(),
  sampleMediaComponentLanguage: z
    .object({
      href: z.string()
    })
    .optional(),
  mediaComponent: z
    .object({
      href: z.string()
    })
    .optional(),
  mediaLanguage: z
    .object({
      href: z.string()
    })
    .optional()
})
