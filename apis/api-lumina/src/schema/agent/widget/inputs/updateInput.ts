import { z } from 'zod'

import { builder } from '../../../builder'

const schema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  enabled: z.boolean().optional(),
  position: z.string().optional(),
  theme: z.string().optional(),
  buttonText: z.string().optional(),
  buttonIcon: z.string().optional(),
  primaryColor: z.string().optional(),
  allowedDomains: z
    .string()
    .min(1, 'Allowed domain is required')
    .array()
    .min(1, 'Allowed domains are required')
    .optional()
})

export const AgentWidgetUpdateInput = builder.inputType(
  'LuminaAgentWidgetUpdateInput',
  {
    fields: (t) => ({
      name: t.string({ required: false }),
      enabled: t.boolean({ required: false }),
      position: t.string({ required: false }),
      theme: t.string({ required: false }),
      buttonText: t.string({ required: false }),
      buttonIcon: t.string({ required: false }),
      primaryColor: t.string({ required: false }),
      allowedDomains: t.stringList({ required: false })
    }),
    validate: {
      schema
    }
  }
)
