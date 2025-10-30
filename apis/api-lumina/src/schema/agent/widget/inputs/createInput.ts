import { z } from 'zod'

import { builder } from '../../../builder'

const schema = z.object({
  agentId: z.string().uuid('Agent ID must be a valid UUID'),
  name: z.string().min(1, 'Name is required'),
  enabled: z.boolean(),
  position: z.string().optional(),
  theme: z.string().optional(),
  buttonText: z.string().optional(),
  buttonIcon: z.string().optional(),
  primaryColor: z.string().optional(),
  allowedDomains: z.string().array().min(1, 'Allowed domains are required')
})

export const AgentWidgetCreateInput = builder.inputType(
  'LuminaAgentWidgetCreateInput',
  {
    fields: (t) => ({
      agentId: t.string({ required: true }),
      name: t.string({ required: true }),
      enabled: t.boolean({ required: true }),
      position: t.string({ required: false }),
      theme: t.string({ required: false }),
      buttonText: t.string({ required: false }),
      buttonIcon: t.string({ required: false }),
      primaryColor: t.string({ required: false }),
      allowedDomains: t.stringList({ required: true })
    }),
    validate: {
      schema
    }
  }
)
