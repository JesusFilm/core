import { z } from 'zod'

const StepBlock = z.object({
  id: z.string(),
  journeyId: z.string(),
  nextBlockId: z.string().nullable(),
  locked: z.boolean(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable(),
  x: z.number().nullable(),
  y: z.number().nullable(),
  slug: z.string().nullable()
})

export { StepBlock }
