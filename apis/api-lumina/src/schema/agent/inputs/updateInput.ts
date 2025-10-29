import { z } from 'zod'

import { builder } from '../../builder'

const schema = z.object({
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  model: z.string().optional(),
  systemPrompt: z.string().optional().nullable(),
  temperature: z.number().optional(),
  maxTokens: z.number().int().optional().nullable(),
  topP: z.number().optional().nullable(),
  frequencyPenalty: z.number().optional().nullable(),
  presencePenalty: z.number().optional().nullable()
})

export const AgentUpdateInput = builder.inputType('LuminaAgentUpdateInput', {
  fields: (t) => ({
    name: t.string({ required: false }),
    description: t.string({ required: false }),
    model: t.string({ required: false }),
    systemPrompt: t.string({ required: false }),
    temperature: t.float({ required: false }),
    maxTokens: t.int({ required: false }),
    topP: t.float({ required: false }),
    frequencyPenalty: t.float({ required: false }),
    presencePenalty: t.float({ required: false })
  }),
  validate: {
    schema
  }
})
