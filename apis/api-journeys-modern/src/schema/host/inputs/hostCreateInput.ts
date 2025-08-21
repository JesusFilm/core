import { builder } from '../../builder'

export const HostCreateInput = builder.inputType('HostCreateInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    location: t.string({ required: false }),
    src1: t.string({ required: false }),
    src2: t.string({ required: false })
  })
})
