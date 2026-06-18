import { builder } from '../../builder'

export const TeamUpdateInput = builder.inputType('TeamUpdateInput', {
  fields: (t) => ({
    title: t.string({ required: false }),
    publicTitle: t.string({ required: false })
  })
})
