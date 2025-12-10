import { builder } from '../../builder'
import { App } from '../enums/app'

export const MeInput = builder.inputType('MeInput', {
  fields: (t) => ({
    redirect: t.string({ required: false }),
    app: t.field({
      type: App,
      required: false
    })
  })
})
