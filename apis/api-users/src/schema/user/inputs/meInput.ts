import { builder } from '../../builder'

export const MeInput = builder.inputType('MeInput', {
  fields: (t) => ({
    redirect: t.string({ required: false })
  })
})
