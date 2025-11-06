import { z } from 'zod'

import { builder } from '../../builder'

const schema = z.object({
  teamId: z.string().uuid('Team ID must be a valid UUID'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(0).max(2).optional(),
  presencePenalty: z.number().min(0).max(2).optional()
})

export const AgentCreateInput = builder.inputType('LuminaAgentCreateInput', {
  fields: (t) => ({
    teamId: t.id({ required: true }),
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    model: t.string({ required: true }),
    systemPrompt: t.string({ required: false }),
    temperature: t.float({ required: true }),
    maxTokens: t.int({ required: false }),
    topP: t.float({ required: false }),
    frequencyPenalty: t.float({ required: false }),
    presencePenalty: t.float({ required: false })
  }),
  validate: {
    schema
  }
})
