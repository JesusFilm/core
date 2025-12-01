import { builder } from '../../builder'
import { App } from '../enums/app'

export const CreateVerificationRequestInput = builder.inputType(
  'CreateVerificationRequestInput',
  {
    fields: (t) => ({
      redirect: t.string({ required: false }),
      app: t.field({
        type: App,
        required: false
      })
    })
  }
)
