import { builder } from '../../builder'

export const TeamUpdateInput = builder.inputType('LuminaTeamUpdateInput', {
  fields: (t) => ({
    name: t.string({ required: true })
  })
})
