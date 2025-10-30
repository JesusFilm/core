import { z } from 'zod'

import { builder } from '../../../builder'

const schema = z.object({
  agentId: z.string().uuid('Agent ID must be a valid UUID'),
  name: z.string().min(1, 'Name is required'),
  enabled: z.boolean(),
  subdomain: z.string().optional(),
  customDomain: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
})

export const AgentWebsiteCreateInput = builder.inputType(
  'LuminaAgentWebsiteCreateInput',
  {
    fields: (t) => ({
      agentId: t.string({ required: true }),
      name: t.string({ required: true }),
      enabled: t.boolean({ required: true }),
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
