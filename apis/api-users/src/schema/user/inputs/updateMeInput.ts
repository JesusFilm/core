import { builder } from '../../builder'

export const UpdateMeInput = builder.inputType('UpdateMeInput', {
  fields: (t) => ({
    firstName: t.string({ required: true }),
    lastName: t.string({ required: false }),
    email: t.string({ required: true })
  })
})
