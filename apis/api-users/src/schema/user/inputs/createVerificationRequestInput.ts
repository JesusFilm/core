import { builder } from '../../builder'

export const CreateVerificationRequestInput = builder.inputType(
  'CreateVerificationRequestInput',
  {
    fields: (t) => ({
      redirect: t.string({ required: false })
    })
  }
)
