import { builder } from '../../builder'

export const TeamCreateInput = builder.inputType('TeamCreateInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    publicTitle: t.string({ required: false })
  })
})
