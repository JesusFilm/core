import { builder } from '../../builder'

export const TeamUpdateInput = builder.inputType('TeamUpdateInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    publicTitle: t.string({ required: false })
  })
})
