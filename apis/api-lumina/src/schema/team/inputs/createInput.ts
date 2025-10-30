import { z } from 'zod'

import { builder } from '../../builder'

const schema = z.object({
  name: z.string().min(1, 'Name is required')
})

export const TeamCreateInput = builder.inputType('LuminaTeamCreateInput', {
  fields: (t) => ({
    name: t.string({ required: true })
  }),
  validate: {
    schema
  }
})
