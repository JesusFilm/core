import { builder } from '../../builder'

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
    presencePenalty: t.float({ required: false }),
  })
})
