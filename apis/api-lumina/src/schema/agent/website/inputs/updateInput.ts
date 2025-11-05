import { z } from 'zod'

import { builder } from '../../../builder'

const schema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  enabled: z.boolean().optional(),
  subdomain: z
    .string()
    .regex(
      /^(?!-)[a-z0-9-]{1,63}(?<!-)$/i,
      'Invalid subdomain (letters, numbers, and hyphens only)'
    )
    .optional(),
  customDomain: z
    .string()
    .regex(
      /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i,
      'Invalid custom domain (e.g., example.com)'
    )
    .optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
})

export const AgentWebsiteUpdateInput = builder.inputType(
  'LuminaAgentWebsiteUpdateInput',
  {
    fields: (t) => ({
      name: t.string({ required: false }),
      enabled: t.boolean({ required: false }),
      subdomain: t.string({ required: false }),
      customDomain: t.string({ required: false }),
      metaTitle: t.string({ required: false }),
      metaDescription: t.string({ required: false })
    }),
    validate: {
      schema
    }
  }
)
