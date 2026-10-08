import { z } from 'zod'

import { nameSchema } from '../journeySchema'

export const guideOutputSchema = z.object({
  route: z
    .enum(['reply', 'ask', 'unsupported', 'change', 'build'])
    .describe('Exactly one route'),
  reply: z
    .string()
    .describe(
      'What the user sees. For change, a one-line confirmation such as "Adding a poll after step 2."'
    ),
  brief: z
    .string()
    .optional()
    .describe(
      'Only for change: the request in one or two plain sentences, naming steps by name where the user pointed at something'
    ),
  kind: z
    .enum(['create', 'edit'])
    .optional()
    .describe('Only for change: create when there is no journey yet, else edit'),
  questions: z
    .array(z.string())
    .optional()
    .describe('Only for ask: one to three short questions')
})
export type GuideOutput = z.infer<typeof guideOutputSchema>

const plannedStepSchema = z.object({
  name: nameSchema,
  purpose: z.string().describe('One line'),
  content: z
    .array(z.string())
    .describe('Content types in order, e.g. ["heading", "text", "poll"]'),
  links: z
    .array(z.string())
    .describe('Step names its buttons, options or next lead to')
})

const plannedChangeSchema = z.object({
  op: z.enum(['add', 'update', 'remove', 'move']),
  step: nameSchema.describe('The step this change is in or affects'),
  name: nameSchema.describe('The step or item being changed (new name for add)'),
  detail: z
    .string()
    .describe('What to do, including the position for add and move')
})

export const planSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('create'),
    title: z.string(),
    steps: z.array(plannedStepSchema).min(1),
    assumptions: z.array(z.string())
  }),
  z.object({
    kind: z.literal('edit'),
    changes: z.array(plannedChangeSchema).min(1),
    keep: z
      .array(nameSchema)
      .describe('Every existing step name not touched by changes'),
    assumptions: z.array(z.string())
  })
])
export type Plan = z.infer<typeof planSchema>

export const plannerOutputSchema = z.object({
  plan: planSchema
    .optional()
    .describe('The plan. Leave out only when you must ask a question.'),
  question: z
    .string()
    .optional()
    .describe(
      'Only when the brief cannot be planned without guessing something important'
    )
})
export type PlannerOutput = z.infer<typeof plannerOutputSchema>

export const summaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'Decisions and preferences only, such as "no videos", "teen audience" or "keep steps short". Under 120 words.'
    )
})

export const imageChoiceSchema = z.object({
  choices: z.array(
    z.object({
      name: z.string().describe('The image name'),
      index: z
        .number()
        .int()
        .min(0)
        .describe('Index of the best candidate for that image')
    })
  )
})
