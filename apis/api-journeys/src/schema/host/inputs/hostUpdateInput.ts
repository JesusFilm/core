import { builder } from '../../builder'

export const HostUpdateInput = builder.inputType('HostUpdateInput', {
  fields: (t) => ({
    title: t.string({
      required: false,
      description:
        'title can be undefined as to not update title, but it cannot be null as to clear the value of title'
    }),
    location: t.string({ required: false }),
    src1: t.string({ required: false }),
    src2: t.string({ required: false })
  })
})
