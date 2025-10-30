import { z } from 'zod'

import { builder } from '../../../builder'

const schema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  enabled: z.boolean().optional(),
  subdomain: z.string().optional(),
  customDomain: z.string().optional(),
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
